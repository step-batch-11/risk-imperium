import { invade } from "../APIS.js";
import { renderGameState } from "../utilities.js";

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

const removeHighlights = () => {
  const territories = document.querySelectorAll(".territory");
  territories.forEach((territory) => {
    territory.classList.remove("highlight");
  });
};

const isMyTerritory = (gameState, attacker) => {
  return gameState.player.territories.includes(attacker);
};

const getAttackingTroop = (gameState, attacker) => {
  const troopCount = gameState.territories[attacker].troopCount;
  const attackingTroop = Math.min(troopCount - 1, 3);
  return attackingTroop;
};

const isNeighbourTerritory = (gameState, selectedTerritoryId) => {
  if (!gameState.invadeDetials) return false;
  return gameState.invadeDetials.neighbours.includes(selectedTerritoryId);
};

const createMessage = (gameState, attackerTerritoryId, defenderTerritoryId) => {
  const playerName = gameState.player.name;
  const attackingTerritory = gameState.territories[attackerTerritoryId].name;
  const attackMessage = `${playerName} is attacking from ${attackingTerritory}`;
  if (defenderTerritoryId) {
    const defendingTerritory = gameState.territories[defenderTerritoryId].name;
    return `${attackMessage} to ${defendingTerritory}`;
  }

  return attackMessage;
};

const selectAttacker = (gameState, selectedTerritoryId) => {
  removeHighlights();
  const neighbours = opponentNeighbours(
    gameState.player,
    gameState.territories,
    selectedTerritoryId,
  );

  gameState.invadeDetials = { attacker: selectedTerritoryId, neighbours };

  highlightTerritories(neighbours);
  return {
    message: createMessage(gameState, selectedTerritoryId),
  };
};

const selectDefender = async (gameState, selectedTerritoryId) => {
  removeHighlights();
  const attackerTerritoryId = gameState.invadeDetials.attacker;
  const defenderTerritoryId = selectedTerritoryId;
  const attackerTroops = getAttackingTroop(gameState, attackerTerritoryId);

  const { action } = await invade({
    attackerTerritoryId,
    defenderTerritoryId,
    attackerTroops,
  });

  gameState.state = action;
  renderGameState(action);

  return {
    message: createMessage(gameState, attackerTerritoryId, defenderTerritoryId),
    status: "info",
  };
};

const canAttack = (gameState, selectedTerritoryId) => {
  return gameState.territories[selectedTerritoryId].troopCount > 1;
};

export const handleInvasion = async (territory, gameState) => {
  const selectedTerritoryId = parseInt(territory.dataset.territoryId);
  if (
    isMyTerritory(gameState, selectedTerritoryId) &&
    canAttack(gameState, selectedTerritoryId)
  ) {
    return selectAttacker(gameState, selectedTerritoryId);
  }

  if (isNeighbourTerritory(gameState, selectedTerritoryId)) {
    return await selectDefender(gameState, selectedTerritoryId);
  }

  return { message: "Invalid territory", status: "warning" };
};
