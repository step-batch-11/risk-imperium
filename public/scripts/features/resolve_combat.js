import { combat } from "../server_calls.js";
import {
  resolveCombatMsg,
  showNotification,
} from "../utilities/notifications.js";
import { setUpNextPhase } from "../transition_handlers.js";
import { delay, updateTroopsInTerritories } from "../utilities.js";

const changeTerritoryOwner = (updatedTerritories, playerId) => {
  updatedTerritories.forEach((territory) => {
    const territoryElement = document.querySelector(
      `[data-territory-id="${territory.territoryId}"]`,
    );
    territoryElement.dataset.player = playerId;
  });
};

export const handleCombat = async (gameState) => {
  const { action: newState, data } = await combat();
  const updatedTerritories = data.updatedTerritories;
  const message = resolveCombatMsg(gameState, "you", data);
  await delay(2000);

  updateTroopsInTerritories(gameState, updatedTerritories);
  if (data.hasWon) {
    const playerId = gameState.player.colorId;
    changeTerritoryOwner(updatedTerritories, playerId);
  }
  showNotification(message, data.notifyMsg.status);

  setUpNextPhase(gameState, newState);
};
