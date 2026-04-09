import { sendReinforceRequest } from "../server_calls.js";
import {
  addListenerTroopSelector,
  displayTroopSelector,
  setTroopLimit,
  updateTroopsInTerritories,
} from "../utilities.js";
import { showNotification } from "../utilities/notifications.js";
import { setUpNextPhase } from "../transition_handlers.js";
import {
  NOTIFICATION_MESSAGES,
  NOTIFICATION_TYPES,
} from "../configs/notification_config.js";
import {
  renderCurrentPlayerName,
  renderRemainingTroopsToDeploy,
} from "../utilities/render_UI.js";
import { removeCardAreaListener } from "./cards.js";

const notifyNotOwned = (gameState, id) => {
  const territoryName = gameState.territories[id].name;
  const message = `${territoryName} isn't under your control`;
  showNotification(message, NOTIFICATION_TYPES.WARNING);
};

const notifyDeployment = (gameState, territoryId, troopCount) => {
  const player = gameState.player.name;
  const territoryName = gameState.territories[territoryId].name;
  const message = `${player} deployed ${troopCount} troops in ${territoryName}`;
  showNotification(message, NOTIFICATION_TYPES.SUCCESS);
};

const getTerritoryId = (territory) => Number(territory.dataset.territoryId);

const isOwned = (gameState, id) => gameState.player.territories.includes(id);

const updateRemainingTroops = (remainingTroops) => {
  if (remainingTroops !== undefined) {
    renderRemainingTroopsToDeploy(remainingTroops);
    setTroopLimit(remainingTroops);
  }
};

const updateAfterDeploy = (gameState, response, troopCount) => {
  const {
    action: nextState,
    data: { updatedTerritory, remainingTroops, currentPlayerId },
  } = response;

  updateTroopsInTerritories(gameState, updatedTerritory);
  const updatedTerritoryId = updatedTerritory[0].territoryId;

  notifyDeployment(gameState, updatedTerritoryId, troopCount);
  updateRemainingTroops(remainingTroops);
  gameState.currentPlayer = currentPlayerId;
  renderCurrentPlayerName(gameState);
  setUpNextPhase(gameState, nextState);
};

const handleCustomDeployment = (event, gameState, territoryId) => {
  const handleSelection = (troopCount) =>
    deployTroops(event, gameState, territoryId, troopCount);

  addListenerTroopSelector(handleSelection);
  displayTroopSelector(event);
};

const deployTroops = (_event, gameState, territoryId, troopCount = 1) => {
  removeCardAreaListener(gameState);
  return sendReinforceRequest({ territoryId, troopCount })
    .then((res) => updateAfterDeploy(gameState, res, troopCount))
    .catch((e) => {
      console.log(e);

      showNotification(NOTIFICATION_MESSAGES.ERROR, NOTIFICATION_TYPES.WARNING);
    });
};

const handleReinforcement = (territory, gameState, handleDeployment, event) => {
  const territoryId = getTerritoryId(territory);
  if (!isOwned(gameState, territoryId)) {
    return notifyNotOwned(gameState, territoryId);
  }

  handleDeployment(event, gameState, territoryId);
};

export const initialReinforcement = (territory, gameState) => {
  handleReinforcement(territory, gameState, deployTroops);
};

export const reinforce = (territory, gameState, event) => {
  handleReinforcement(territory, gameState, handleCustomDeployment, event);
};
