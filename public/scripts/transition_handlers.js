import { APIs } from "./configs/APIS.js";
import {
  getMoveInData,
  getNewUpdates,
  sendPostRequest,
  skipFortificationRequest,
  skipInvasionRequest,
} from "./server_calls.js";
import {
  delay,
  getAllPlayersDetail,
  removeSkipButton,
  setTroopLimit,
} from "./utilities.js";
import { USER_ACTIONS } from "./configs/user_action.js";

import {
  renderCurrentPlayerName,
  renderGameState,
  renderRemainingTroopsToDeploy,
} from "./utilities/render_UI.js";
import {
  highlightTerritories,
  removeHighlights,
} from "./utilities/highlight.js";
import { STATES } from "./configs/game_states.js";
import { territoryToFortifyFrom } from "./handlers/fortified_handler.js";
import {
  getCard,
  removeCardAreaListener,
  renderTradeIndicator,
} from "./features/cards.js";
import { handleDefense } from "./features/defend.js";
import { renderTerritoriesAndTroops } from "./features/initial_territory_allocate.js";
import { handleCombat } from "./features/resolve_combat.js";
import { captureTerritory } from "./features/capture_territory.js";
import { showNotification } from "./utilities/notifications.js";
import { SPECTATOR_MSGs } from "./configs/spectator_messages.js";
import { createAvatar } from "./lobby/lobby.js";
import {
  NOTIFICATION_MESSAGES,
  NOTIFICATION_TYPES,
} from "./configs/notification_config.js";
import { SFX } from "./configs/SFX.js";
import { renderPlayersDetails } from "./features/setup.js";

const setupInitialReinforcementPhase = async (gameState) => {
  const { data } = await sendPostRequest(APIs.USER_ACTIONS, {
    userActions: USER_ACTIONS.SETUP,
  });

  const territories = gameState.player.territories;

  renderRemainingTroopsToDeploy(data.troopsToReinforce);

  SFX.TURN.play();
  highlightTerritories(territories);
};

const setupReinforcePhase = async (gameState) => {
  const { data } = await sendPostRequest(APIs.USER_ACTIONS, {
    userActions: USER_ACTIONS.SETUP,
  });

  const territories = gameState.player.territories;

  setTroopLimit(data.troopsToReinforce);
  renderRemainingTroopsToDeploy(data.troopsToReinforce);
  highlightTerritories(territories);

  SFX.TURN.play();

  renderTradeIndicator(gameState);
};

const addInvasionSkipButton = (gameState) => {
  const skipButtonTemplate = document.querySelector("#skip-button-template");

  const cloneNode = skipButtonTemplate.content.cloneNode(true);
  const body = document.querySelector("body");
  const skipButtonElement = cloneNode.querySelector("#skip-button");

  skipButtonElement.addEventListener("click", async () => {
    const { action: newState } = await skipInvasionRequest();
    removeHighlights("selected");
    removeHighlights("highlight");
    removeSkipButton();
    setUpNextPhase(gameState, newState);
  });
  body.append(cloneNode);
};

const sourceTerritoryForAttacks = (territoryIds, gameState) => {
  return territoryIds.filter((territoryId) => {
    const territory = gameState.territories[territoryId];
    const isValidTroopCount = territory.troopCount > 1;
    const canAttackNeighbour = territory.neighbours.some(
      (neighbourId) => !territoryIds.includes(neighbourId),
    );
    return isValidTroopCount && canAttackNeighbour;
  });
};

const setupInvasionPhase = (gameState) => {
  renderTradeIndicator(gameState);
  const territoryIds = gameState.player.territories;
  const attackableTerritories = sourceTerritoryForAttacks(
    territoryIds,
    gameState,
  );

  addInvasionSkipButton(gameState);
  removeHighlights("selected");
  removeHighlights("highlight");
  removeHighlights("target");
  removeCardAreaListener(gameState);
  highlightTerritories(attackableTerritories, "can-attack");
};

const createSkipButtonElement = () => {
  const skipButtonTemplate = document.querySelector("#skip-button-template");

  const cloneNode = skipButtonTemplate.content.cloneNode(true);
  const body = document.querySelector("body");
  const skipButtonElement = cloneNode.querySelector("#skip-button");
  body.append(cloneNode);
  return skipButtonElement;
};

export const setupFortification = (gameState) => {
  const skipButtonElement = createSkipButtonElement();
  const fortifiableTerritory = territoryToFortifyFrom(gameState);

  removeHighlights("selected");
  removeHighlights("target");
  removeHighlights("can-attack");

  highlightTerritories(fortifiableTerritory.flat(), "can-fortify");

  skipButtonElement.addEventListener("click", async () => {
    const { action: newState } = await skipFortificationRequest();
    removeHighlights("can-fortify");
    setUpNextPhase(gameState, newState);
    removeSkipButton();
  });
};

const handleGetCard = async (gameState) => {
  const action = await getCard(gameState);
  setUpNextPhase(gameState, action);
};

const setupDefendPhase = (gameState) => {
  handleDefense(gameState);
};

const updateGameState = (gameState, newState) => {
  for (const key in newState) {
    gameState[key] = newState[key];
  }
};

const showLastUpdates = async (gameState, lastAction) => {
  const { action, data, playerId } = lastAction;

  const player = gameState.opponents[playerId];

  if (!player || !action) {
    return;
  }

  const messageFormatter = SPECTATOR_MSGs[action];

  if (messageFormatter) {
    const message = messageFormatter(gameState, player.name, data);
    if (action === STATES.RESOLVE_COMBAT) {
      await delay(2000);
    }

    showNotification(message);
  }
};

const handleWaiting = async (gameState) => {
  let newState = gameState.state;
  while (newState === STATES.WAITING) {
    const { action, data, lastAction } = await getNewUpdates();
    newState = action;

    updateGameState(gameState, data);

    await showLastUpdates(gameState, lastAction);

    renderCurrentPlayerName(gameState);
    renderGameState(gameState);
    const players = getAllPlayersDetail(gameState.player, gameState.opponents);
    renderTerritoriesAndTroops(players, gameState.territories);
    if (action !== STATES.WON && action !== STATES.ELIMINATED) {
      renderPlayersDetails(gameState);
    }
  }

  gameState.state = STATES.WAITING;

  setUpNextPhase(gameState, newState);
};

const handleMoveIn = async (gameState) => {
  const { data: lastUpdate } = await getMoveInData();

  captureTerritory(
    gameState,
    lastUpdate.data.invadeDetails,
    lastUpdate.data.updatedTerritories,
  );
};

const handleElimination = (_gameState) => {
  setTimeout(() => {
    const dialoge = document.querySelector("#elimination-box");
    dialoge.classList.toggle("hide-screen");
  }, 1500);
};

const handleWin = (gameState) => {
  const dialoge = document.querySelector(".winning-screen");
  dialoge.classList.toggle("hide-screen");
  const nameContainer = dialoge.querySelector("#winner-name");
  const avatarContainer = dialoge.querySelector("#winner-container");
  const avatar = createAvatar(gameState.player.avatar);
  avatarContainer.prepend(avatar);
  nameContainer.textContent = gameState.player.name;
};

export const SETUP_TRANSITION = {
  [STATES.INITIAL_REINFORCEMENT]: setupInitialReinforcementPhase,
  [STATES.REINFORCE]: setupReinforcePhase,
  [STATES.INVASION]: setupInvasionPhase,
  [STATES.DEFEND]: setupDefendPhase,
  [STATES.FORTIFICATION]: setupFortification,
  [STATES.RESOLVE_COMBAT]: handleCombat,
  [STATES.MOVE_IN]: handleMoveIn,
  [STATES.GET_CARD]: handleGetCard,
  [STATES.WAITING]: handleWaiting,
  [STATES.ELIMINATED]: handleElimination,
  [STATES.WON]: handleWin,
};

const removeTerritoryHighlights = () => {
  const territoryElements = document.querySelectorAll(".territory");
  territoryElements.forEach((territory) => {
    territory.classList.remove("selected");
    territory.classList.remove("highlight");
    territory.classList.remove("target");
    territory.classList.remove("can-attack");
  });
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const playIntroReveal = async (gameState) => {
  const mapSvg = document.getElementById("map-svg");
  const myTerritories = gameState.player.territories;

  showNotification(
    NOTIFICATION_MESSAGES.TERRITORY_ALLOCATED,
    NOTIFICATION_TYPES.INFO,
    2500,
  );

  mapSvg.classList.add("intro-dim");

  highlightTerritories(myTerritories, "intro-flash");
  await sleep(2500);

  mapSvg.classList.remove("intro-dim");
  removeHighlights("intro-flash");
};

export const setUpNextPhase = (gameState, nextState) => {
  if (gameState.state === nextState) {
    return;
  }

  gameState.state = nextState;
  removeTerritoryHighlights();
  renderGameState(gameState);

  if (nextState in SETUP_TRANSITION) {
    return SETUP_TRANSITION[nextState](gameState);
  }
};
