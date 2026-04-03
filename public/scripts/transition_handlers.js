import { APIs } from "./configs/APIS.js";
import {
  sendPostRequest,
  skipFortificationRequest,
  skipInvasionRequest,
} from "./server_calls.js";
import { removeSkipButton, setTroopLimit } from "./utilities.js";
import { USER_ACTIONS } from "./configs/user_action.js";

import {
  renderGameState,
  renderRemainingTroopsToDeploy,
} from "./utilities/render_UI.js";
import {
  highlightTerritories,
  removeHighlights,
} from "./utilities/highlight.js";
import { STATES } from "./configs/game_states.js";
import { territoryToFortifyFrom } from "./handlers/fortified_handler.js";
import { getCard, renderTradeIndicator } from "./features/cards.js";

const setupInitialReinforcementPhase = async (gameState) => {
  const { data } = await sendPostRequest(APIs.USER_ACTIONS, {
    userActions: USER_ACTIONS.SETUP,
  });

  const territories = gameState.player.territories;
  renderRemainingTroopsToDeploy(data.troopsToReinforce);
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
  renderTradeIndicator(gameState);
};

const addInvasionSkipButton = (gameState) => {
  const skipButtonTemplate = document.querySelector(
    "#skip-button-template",
  );

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
      (neighbourId) => (!territoryIds.includes(neighbourId)),
    );
    return isValidTroopCount && canAttackNeighbour;
  });
};

const setupInvasionPhase = (gameState) => {
  const territoryIds = gameState.player.territories;
  const attackableTerritories = sourceTerritoryForAttacks(
    territoryIds,
    gameState,
  );

  addInvasionSkipButton(gameState);
  removeHighlights("selected");
  highlightTerritories(attackableTerritories);
};

const createSkipButtonElement = () => {
  const skipButtonTemplate = document.querySelector(
    "#skip-button-template",
  );

  const cloneNode = skipButtonTemplate.content.cloneNode(true);
  const body = document.querySelector("body");
  const skipButtonElement = cloneNode.querySelector("#skip-button");
  body.append(cloneNode);
  return skipButtonElement;
};

export const setupFortification = (gameState) => {
  const skipButtonElement = createSkipButtonElement();
  const fortifiableTerritory = territoryToFortifyFrom(gameState);

  highlightTerritories(fortifiableTerritory.flat());

  skipButtonElement.addEventListener("click", async () => {
    const { action: newState } = await skipFortificationRequest();
    setUpNextPhase(gameState, newState);
    removeSkipButton();
  });
};

const handleGetCard = async (gameState) => {
  const action = await getCard(gameState);
  setUpNextPhase(gameState, action);
};

export const SETUP_TRANSITION = {
  [STATES.INITIAL_REINFORCEMENT]: setupInitialReinforcementPhase,
  [STATES.REINFORCE]: setupReinforcePhase,
  [STATES.INVASION]: setupInvasionPhase,
  [STATES.FORTIFICATION]: setupFortification,
  [STATES.GET_CARD]: handleGetCard,
};

export const setUpNextPhase = (gameState, nextState) => {
  if (gameState.state === nextState) {
    return;
  }

  gameState.state = nextState;
  renderGameState(gameState);

  if (nextState in SETUP_TRANSITION) {
    return SETUP_TRANSITION[nextState](gameState);
  }
};
