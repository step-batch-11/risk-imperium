import { sendReinforceRequest } from "../server_calls.js";
import { setTroopLimit } from "../utilities.js";
import { showNotification } from "../utilities/notifications.js";
import { setUpNextPhase } from "../transition_handlers.js";
import {
  NOTIFICATION_MESSAGES,
  NOTIFICATION_TYPES,
} from "../configs/notification_config.js";
import {
  renderGameState,
  renderRemainingTroopsToDeploy,
  renderUpdatedTroopCount,
} from "../utilities/render_UI.js";

const notifyNotOwned = (gameState, id) => {
  const territoryName = gameState.territories[id].name;
  const message = `${territoryName} isn't under your control`;
  showNotification(message, NOTIFICATION_TYPES.WARNING);
};

const notifyDeployment = (gameState, data, troopCount) => {
  const player = gameState.player.name;
  const territoryName = gameState.territories[data.territoryId].name;
  const message = `${player} deployed ${troopCount} troops in ${territoryName}`;
  showNotification(message, NOTIFICATION_TYPES.SUCCESS);
};

const getTerritoryId = (territory) => Number(territory.dataset.territoryId);

const isOwned = (gameState, id) => gameState.player.territories.includes(id);

const updateRemainingTroops = (remainingTroops) => {
  if (remainingTroops !== undefined) {
    renderRemainingTroopsToDeploy(remainingTroops);
  }
};

const updateAfterDeploy = (gameState, territory, response, troopCount) => {
  const { action: nextState, data } = response;

  renderGameState(nextState);

  applyTroopUpdate(gameState, territory, data);
  notifyDeployment(gameState, data, troopCount);
  updateRemainingTroops(data.remainingTroops);

  setUpNextPhase(gameState, nextState);
};

const applyTroopUpdate = (gameState, territory, data) => {
  renderUpdatedTroopCount(territory, data.newTroopCount);
  gameState.territories[data.territoryId].troopCount = data.newTroopCount;
};

const handleCustomDeployment = (gameState, territory, territoryId) => {
  const dialog = document.querySelector("#deploy-troops-container");
  const form = dialog.querySelector("#deploy-troops-form");
  const input = form.querySelector("input");

  dialog.showModal();

  form.onsubmit = async (e) => {
    e.preventDefault();

    const troopCount = Number(input.value);
    await deployTroops(gameState, territory, territoryId, troopCount);

    const remainingTroops = Number(input.max) - troopCount;
    setTroopLimit(remainingTroops);

    form.reset();
    dialog.close();
  };
};

const deployTroops = async (
  gameState,
  territory,
  territoryId,
  troopCount = 1,
) => {
  try {
    const res = await sendReinforceRequest({ territoryId, troopCount });
    updateAfterDeploy(gameState, territory, res, troopCount);
  } catch {
    showNotification(NOTIFICATION_MESSAGES.ERROR, NOTIFICATION_TYPES.WARNING);
  }
};

const handleReinforcement = (territory, gameState, handleDeployment) => {
  const territoryId = getTerritoryId(territory);
  if (!isOwned(gameState, territoryId)) {
    return notifyNotOwned(gameState, territoryId);
  }
  handleDeployment(gameState, territory, territoryId);
};

export const initialReinforcement = (territory, gameState) => {
  handleReinforcement(territory, gameState, deployTroops);
};

export const reinforce = (territory, gameState) => {
  handleReinforcement(territory, gameState, handleCustomDeployment);
};
