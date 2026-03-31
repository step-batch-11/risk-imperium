import { APIs } from "../APIS.js";
import { SETUP_TRANSITION } from "../config.js";
import { sendPostRequest } from "../server_calls.js";
import { setTroopLimit } from "../transition.js";
import {
  displayRemainingTroopsToDeploy,
  renderGameState,
  showNotification,
  updateTroopCount,
} from "../utilities.js";

const NOTIFY_STATUS = {
  WARNING: "warning",
  SUCCESS: "success",
  INFO: "info",
};

const setUpNextPhase = (gameState, nextState) => {
  gameState.state = nextState;
  if (nextState in SETUP_TRANSITION) {
    return SETUP_TRANSITION[nextState](gameState);
  }
};

const isOwnedByCurrentPlayer = (territoryId, playerTerritoryIds) =>
  playerTerritoryIds.includes(territoryId);

const deployTroops = async (
  gameState,
  territory,
  territoryId,
  troopCount = 1,
) => {
  const payLoad = {
    userActions: "REINFORCE",
    data: { territoryId, troopCount },
  };

  const response = await sendPostRequest(APIs.USER_ACTIONS, payLoad);
  const { action: nextState, data: updatedTerritory } = response;

  if (nextState !== gameState.state) {
    renderGameState(nextState);
    setUpNextPhase(gameState, nextState);
  }

  const { territoryId: updatedTerritoryId, newTroopCount } = updatedTerritory;
  updateTroopCount(territory, newTroopCount);

  gameState.territories[updatedTerritoryId].troopCount = newTroopCount;

  const playerName = gameState.player.name;
  const territoryName = gameState.territories[updatedTerritoryId].name;

  const message =
    `${playerName} deployed ${troopCount} troop in ${territoryName}`;
  const remainingTroopsToDeploy = updatedTerritory.remainingTroops;

  if (remainingTroopsToDeploy !== undefined) {
    displayRemainingTroopsToDeploy(remainingTroopsToDeploy);
  }

  showNotification(message, NOTIFY_STATUS.SUCCESS);
};

export const handleInitialReinforcement = async (territory, gameState) => {
  const territoryId = Number(territory.dataset.territoryId);
  const territories = gameState.player.territories;

  if (!isOwnedByCurrentPlayer(territoryId, territories)) {
    const territoryName = gameState.territories[territoryId].name;

    const message = `${territoryName} isn't under your control`;
    return showNotification(message, NOTIFY_STATUS.WARNING);
  }

  return await deployTroops(gameState, territory, territoryId);
};

const placeTroops = (gameState, territory, territoryId) => {
  const dialog = document.querySelector("dialog");
  dialog.showModal();

  const form = dialog.querySelector("#deploy-troops-form");
  form.onsubmit = (event) => {
    event.preventDefault();
    const input = form.querySelector("input");
    const troopCount = Number(input.value);
    deployTroops(gameState, territory, territoryId, troopCount);
    const remainingTroopsToDeploy = Number(input.max) - troopCount;
    setTroopLimit(remainingTroopsToDeploy);
    form.reset();
    dialog.close();
  };
};

export const handleReinforcement = (territory, gameState) => {
  const territoryId = Number(territory.dataset.territoryId);
  const territories = gameState.player.territories;

  if (!isOwnedByCurrentPlayer(territoryId, territories)) {
    const territoryName = gameState.territories[territoryId].name;

    const message = `${territoryName} isn't under your control`;
    return showNotification(message, NOTIFY_STATUS.WARNING);
  }

  return placeTroops(gameState, territory, territoryId);
};
