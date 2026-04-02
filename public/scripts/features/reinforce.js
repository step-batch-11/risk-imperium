import { sendReinforceRequest } from "../server_calls.js";
import { setTroopLimit, updateTroopsInTerritories } from "../utilities.js";
import { showNotification } from "../utilities/notifications.js";
import { setUpNextPhase } from "../transition_handlers.js";
import {
  NOTIFICATION_MESSAGES,
  NOTIFICATION_TYPES,
} from "../configs/notification_config.js";
import { renderRemainingTroopsToDeploy } from "../utilities/render_UI.js";

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
  }
};

const updateAfterDeploy = (gameState, response, troopCount) => {
  const { action: nextState, data: { updatedTerritory, remainingTroops } } =
    response;

  updateTroopsInTerritories(gameState, updatedTerritory);
  const updatedTerritoryId = updatedTerritory[0].territoryId;

  notifyDeployment(gameState, updatedTerritoryId, troopCount);
  updateRemainingTroops(remainingTroops);
  setUpNextPhase(gameState, nextState);
};

const handleCustomDeployment = (gameState, territoryId) => {
  const dialog = document.querySelector("#deploy-troops-container");
  const form = dialog.querySelector("#deploy-troops-form");
  const input = form.querySelector("input");

  dialog.showModal();

  form.onsubmit = async (e) => {
    e.preventDefault();

    const troopCount = Number(input.value);
    await deployTroops(gameState, territoryId, troopCount);

    const remainingTroops = Number(input.max) - troopCount;
    setTroopLimit(remainingTroops);

    form.reset();
    dialog.close();
  };
};

const deployTroops = async (
  gameState,
  territoryId,
  troopCount = 1,
) => {
  try {
    const res = await sendReinforceRequest({ territoryId, troopCount });
    updateAfterDeploy(gameState, res, troopCount);
  } catch {
    showNotification(NOTIFICATION_MESSAGES.ERROR, NOTIFICATION_TYPES.WARNING);
  }
};

const handleReinforcement = (territory, gameState, handleDeployment) => {
  const territoryId = getTerritoryId(territory);
  if (!isOwned(gameState, territoryId)) {
    return notifyNotOwned(gameState, territoryId);
  }
  handleDeployment(gameState, territoryId);
};

export const initialReinforcement = (territory, gameState) => {
  handleReinforcement(territory, gameState, deployTroops);
};

export const reinforce = (territory, gameState) => {
  handleReinforcement(territory, gameState, handleCustomDeployment);
};
