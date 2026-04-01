import { sendReinforceRequest } from "../APIS.js";
import { setTroopLimit } from "../transition.js";
import {
  displayRemainingTroopsToDeploy,
  NOTIFY_STATUS,
  notifyDeployment,
  notifyNotOwned,
  renderGameState,
  setUpNextPhase,
  showNotification,
  updateTroopCount,
} from "../utilities.js";

const getTerritoryId = (territory) => Number(territory.dataset.territoryId);

const isOwned = (gameState, id) => gameState.player.territories.includes(id);

const updateRemainingTroops = (remainingTroops) => {
  if (remainingTroops !== undefined) {
    displayRemainingTroopsToDeploy(remainingTroops);
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
  updateTroopCount(territory, data.newTroopCount);
  gameState.territories[data.territoryId].troopCount = data.newTroopCount;
};

const openDialog = (gameState, territory, territoryId) => {
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
    showNotification("Something went wrong", NOTIFY_STATUS.WARNING);
  }
};

const handleReinforcement = (territory, gameState, fn) => {
  const territoryId = getTerritoryId(territory);

  if (!isOwned(gameState, territoryId)) {
    return notifyNotOwned(gameState, territoryId);
  }

  fn(gameState, territory, territoryId);
};

export const initialReinforcement = (territory, gameState) => {
  handleReinforcement(territory, gameState, deployTroops);
};

export const reinforce = (territory, gameState) => {
  handleReinforcement(territory, gameState, openDialog);
};
