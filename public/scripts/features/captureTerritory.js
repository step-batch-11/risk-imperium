import { NOTIFICATION_TYPES } from "../configs/notification_config.js";
import { getTerritoryElementById } from "../utilities.js";
import { showNotification } from "../utilities/notifications.js";
import { addCardAlert } from "./cards.js";
import { renderPlayersDetails, updateCards } from "./setup.js";

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
  console.log(combatResult);

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

  showNotification(msg);

  if (combatResult.hasEliminated) {
    const msg = `${defender.name} has eliminated`;
    gameState.player.cards = combatResult.newCards;
    updateCards(gameState.player.cards);
    addCardAlert();
    console.log(gameState);
    delete gameState.opponents[defender.id];
    showNotification(msg, NOTIFICATION_TYPES.WARNING);
  }

  renderPlayersDetails(gameState);

  if (combatResult.hasWon) {
    const glassBox = document.querySelector("#glass-box");
    glassBox.classList.remove("d-none");
    // setTimeout(() => {
    //   redirect
    // })
  }
};
