import { NOTIFICATION_TYPES } from "../configs/notification_config.js";
import { STYLES } from "../configs/styles.js";
import { sendCaptureRequest } from "../server_calls.js";
import { setUpNextPhase } from "../transition_handlers.js";
import {
  addListenerTroopSectorCancle,
  addListenerTroopSelector,
  displayTroopSelector,
  getIndexOf,
  getPlayerById,
  getTerritoryElementById,
  setTroopLimit,
  updateTroopsInTerritories,
} from "../utilities.js";
import { showNotification } from "../utilities/notifications.js";
import { addCardAlert, renderTradeIndicator } from "./cards.js";
import { renderPlayersDetails, updateCards } from "./setup.js";

const dialogpositions = (territoryElement) => {
  const element = territoryElement.getBoundingClientRect();
  console.log(element);

  const x = element.left;
  const y = element.bottom;
  // if(y < 0)
  //   y = element.bottom;
  return { x, y };
};

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
  renderTradeIndicator(gameState);
  delete gameState.opponents[defender.id];

  const msg = `${defender.name} has eliminated`;
  showNotification(msg, NOTIFICATION_TYPES.WARNING);
};

const showWinner = (player) => {
  const glassBox = document.querySelector("#glass-box");
  glassBox.classList.remove(STYLES.DISPLAY_NONE);
  const actionMenu = document.querySelector(".action-menu");
  actionMenu.classList.add(STYLES.REMOVE_EVENTS);
  const playerElement = document.querySelector("#winner-name");
  playerElement.textContent = `${player},the great`;
};

const handlePostCapture = async (gameState, defender, troopCount) => {
  const { action, data } = await sendCaptureRequest(troopCount);
  updateTroopsInTerritories(gameState, data.updatedTerritories);
  setUpNextPhase(gameState, action);

  if (data.hasEliminated) {
    return handleElimination(defender, gameState, data);
  }

  renderPlayersDetails(gameState);
  if (data.hasWon) {
    return showWinner(gameState.player.name);
  }
};

export const captureTerritory = (
  gameState,
  { defenderTerritoryId, attackerTerritoryId },
  combatResult,
) => {
  updateTroopsInTerritories(gameState, combatResult.updatedTerritories); //see lt

  const territoryElement = getTerritoryElementById(
    gameState.territories,
    defenderTerritoryId,
  );

  const event = dialogpositions(territoryElement);

  const defender = getPlayerById(gameState.opponents, defenderTerritoryId);

  updatePlayerTerritories(defender, defenderTerritoryId, gameState);
  addPlayerIdToTerritory(gameState, defenderTerritoryId);
  showCapturedMsg(gameState, defenderTerritoryId);
  setTroopLimit(
    gameState.territories[attackerTerritoryId].troopCount - 1,
    0,
    0,
  );

  addListenerTroopSelector((troopCount) =>
    handlePostCapture(gameState, defender, troopCount)
  );

  displayTroopSelector(event);

  addListenerTroopSectorCancle((troopCount) =>
    handlePostCapture(gameState, defender, troopCount)
  );
};
