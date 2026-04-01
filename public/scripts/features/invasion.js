import { invade } from "../server_calls.js";
import { renderGameState } from "../utilities/render_UI.js";
import { removeHighlights } from "../utilities/highlight.js";
import { showNotification } from "../utilities/notifications.js";
import { setUpNextPhase } from "../transition_handlers.js";
import { NOTIFICATION_MESSAGES } from "../configs/notification_config.js";
import { NOTIFICATION_TYPES } from "../configs/notification_config.js";

const highlightTerritories = (territories) => {
  territories.forEach((territoryId) => {
    const territoryElement = document.querySelector(
      `[data-territory-id="${territoryId}"]`,
    );

    territoryElement.parentElement.append(territoryElement);
    territoryElement.classList.add("highlight");
  });
};

const opponentNeighbours = (player, territories, selectedTerritoryId) => {
  const neighbours = territories[selectedTerritoryId].neighbours;
  return neighbours.filter(
    (neighbour) => !player.territories.includes(neighbour),
  );
};

const isMyTerritory = (gameState, attacker) => {
  return gameState.player.territories.includes(attacker);
};

const getAttackingTroop = (gameState, attacker) => {
  const troopCount = gameState.territories[attacker].troopCount;
  const attackingTroop = Math.min(troopCount - 1, 3);
  return attackingTroop;
};

const isNeighbouringOpponent = (gameState, selectedTerritoryId) => {
  if (!gameState.invadeDetials) return false;
  return gameState.invadeDetials.neighbours.includes(selectedTerritoryId);
};

const selectAttacker = (gameState, selectedTerritoryId) => {
  removeHighlights("highlight", ".territory");
  const neighbours = opponentNeighbours(
    gameState.player,
    gameState.territories,
    selectedTerritoryId,
  );

  gameState.invadeDetials = { attacker: selectedTerritoryId, neighbours };

  highlightTerritories(neighbours);
};

const deleteInvadeDetails = (gameState) => {
  delete gameState.invadeDetials;
};

const selectDefender = async (gameState, selectedTerritoryId) => {
  removeHighlights("highlight", ".territory");

  const attackerTerritoryId = gameState.invadeDetials.attacker;
  const defenderTerritoryId = selectedTerritoryId;
  const attackerTroops = getAttackingTroop(gameState, attackerTerritoryId);

  const { newState } = await invade({
    attackerTerritoryId,
    defenderTerritoryId,
    attackerTroops,
  });

  showNotification(
    "Please click on the defender territory. Be human. Be kind.",
    "warning",
    5000,
  );

  deleteInvadeDetails(gameState);
  removeHighlights("selected");

  renderGameState(newState);
  setUpNextPhase(gameState, newState);
};

const canAttack = (gameState, selectedTerritoryId) => {
  return gameState.territories[selectedTerritoryId].troopCount > 1;
};

const isAttackableTerritory = (gameState, territoryId) =>
  isMyTerritory(gameState, territoryId) && canAttack(gameState, territoryId);

export const handleInvasion = async (territory, gameState) => {
  const selectedTerritoryId = Number(territory.dataset.territoryId);

  if (isAttackableTerritory(gameState, selectedTerritoryId)) {
    return selectAttacker(gameState, selectedTerritoryId);
  }

  if (isNeighbouringOpponent(gameState, selectedTerritoryId)) {
    return await selectDefender(gameState, selectedTerritoryId);
  }

  showNotification(
    NOTIFICATION_MESSAGES.INVALID_TERRITORY,
    NOTIFICATION_TYPES.WARNING,
  );
};
