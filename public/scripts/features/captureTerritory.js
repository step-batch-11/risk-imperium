import { NOTIFICATION_TYPES } from "../configs/notification_config.js";
import {
  getIndexOf,
  getPlayerById,
  getTerritoryElementById,
} from "../utilities.js";
import { showNotification } from "../utilities/notifications.js";
import { addCardAlert } from "./cards.js";
import { renderPlayersDetails, updateCards } from "./setup.js";

const updatePlayerTerritories = (defender, defenderTerritoryId, gameState) => {
  const index = getIndexOf(defender.territories, defenderTerritoryId);
  gameState.player.territories.push(...defender.territories.splice(index, 1));
};

const addPlayerIdToTerritory = (gameState, defenderTerritoryId) => {
  const territoryElement = getTerritoryElementById(
    gameState.territories,
    defenderTerritoryId,
  );
  territoryElement.setAttribute("data-player", gameState.player.id);
};

const showCapturedMsg = (gameState, defenderTerritoryId) => {
  const msg = `${gameState.player.name} captured ${
    gameState.territories[defenderTerritoryId].name
  }`;

  showNotification(msg);
};

const handleElimination = (defender, gameState, combatResult) => {
  gameState.player.cards = combatResult.newCards;
  updateCards(gameState.player.cards);
  addCardAlert();
  delete gameState.opponents[defender.id];

  const msg = `${defender.name} has eliminated`;
  showNotification(msg, NOTIFICATION_TYPES.WARNING);
};

const showWinner = (player) => {
  const glassBox = document.querySelector("#glass-box");
  glassBox.classList.remove("d-none");
  const actionMenu = document.querySelector(".action-menu");
  actionMenu.classList.add("remove-events");
  const playerElement = document.querySelector("#winner-name");
  playerElement.textContent = `${player},the greate`;
};

export const captureTerritory = (
  gameState,
  { defenderTerritoryId },
  combatResult,
) => {
  combatResult.updatedTerritories.forEach(({ territoryId, troopCount }) => {
    gameState.territories[territoryId].troopCount = troopCount;
  });

  const defender = getPlayerById(gameState.opponents, defenderTerritoryId);

  updatePlayerTerritories(defender, defenderTerritoryId, gameState);
  addPlayerIdToTerritory(gameState, defenderTerritoryId);
  showCapturedMsg(gameState, defenderTerritoryId);

  if (combatResult.hasEliminated) {
    handleElimination(defender, gameState, combatResult);
  }
  renderPlayersDetails(gameState);
  if (combatResult.hasWon) {
    // setTimeout(() => {
    //   redirect
    // })
    showWinner(gameState.player.name);
  }
};
