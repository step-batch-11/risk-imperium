import { NOTIFICATION_TYPES } from "../configs/notification_config.js";
import { getTerritoryElementById } from "../utilities.js";
import { showNotification } from "../utilities/notifications.js";
import { renderPlayersDetails } from "./setup.js";

const getPlayerById = (players, territoryId) =>
  Object.values(players).find((player) =>
    player.territories.includes(territoryId)
  );

const getIndexOf = (collection, target) =>
  collection.findIndex((element) => element === target);

export const captureTerritory = (
  gameState,
  { defenderTerritoryId },
  combatResult,
) => {
  combatResult.updatedTerritories.forEach(({ territoryId, troopCount }) => {
    gameState.territories[territoryId].troopCount = troopCount;
  });

  const defender = getPlayerById(gameState.opponents, defenderTerritoryId);

  const index = getIndexOf(defender.territories, defenderTerritoryId);
  const territoryElement = getTerritoryElementById(
    gameState.territories,
    defenderTerritoryId,
  );
  territoryElement.setAttribute("data-player", gameState.player.id);
  gameState.player.territories.push(...defender.territories.splice(index, 1));

  const msg = `${gameState.player.name} captured ${
    gameState.territories[defenderTerritoryId].name
  }`;

  if (combatResult.hasEliminated) {
    const msg = `${defender.name} has eliminated`;
    delete gameState.opponents[defender.id];
    showNotification(msg, NOTIFICATION_TYPES.WARNING);
  }

  setTimeout(() => {
    renderPlayersDetails(gameState);
    showNotification(msg);
  }, 1000);
};
