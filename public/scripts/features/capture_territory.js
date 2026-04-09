import { LABELS } from "../configs/label.js";
import { NOTIFICATION_TYPES } from "../configs/notification_config.js";
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

const dialogPositions = (territoryElement) => {
  const element = territoryElement.getBoundingClientRect();

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
  territoryElement.dataset.player = gameState.player.id;
};

const showCapturedMsg = (gameState, defenderTerritoryId) => {
  const msg = `You captured ${gameState.territories[defenderTerritoryId].name}`;
  showNotification(msg, NOTIFICATION_TYPES.SUCCESS);
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

const handlePostCapture = async (gameState, defender, troopCount) => {
  const { action, data } = await sendCaptureRequest(troopCount);
  updateTroopsInTerritories(gameState, data.updatedTerritories);
  setUpNextPhase(gameState, action);

  if (data.hasEliminated) {
    return handleElimination(defender, gameState, data);
  }

  renderPlayersDetails(gameState);
};

export const captureTerritory = (
  gameState,
  { defenderTerritoryId, attackerTerritoryId },
  updatedTerritories,
) => {
  updateTroopsInTerritories(gameState, updatedTerritories); //see lt

  const territoryElement = getTerritoryElementById(
    gameState.territories,
    defenderTerritoryId,
  );

  const event = dialogPositions(territoryElement);

  const defender = getPlayerById(gameState.opponents, defenderTerritoryId);

  updatePlayerTerritories(defender, defenderTerritoryId, gameState);
  addPlayerIdToTerritory(gameState, defenderTerritoryId);
  showCapturedMsg(gameState, defenderTerritoryId);
  const maxLimit = gameState.territories[attackerTerritoryId].troopCount - 1;

  if (maxLimit <= 0) return handlePostCapture(gameState, defender, maxLimit);

  setTroopLimit(
    maxLimit,
    0,
    maxLimit,
  );

  addListenerTroopSelector((troopCount) =>
    handlePostCapture(gameState, defender, troopCount)
  );

  displayTroopSelector(event, LABELS.MOVE_IN);

  addListenerTroopSectorCancle((troopCount) =>
    handlePostCapture(gameState, defender, troopCount)
  );
};
