import { invade } from "../server_calls.js";
import {
  highlightTerritories,
  removeHighlights,
} from "../utilities/highlight.js";
import { showNotification } from "../utilities/notifications.js";
import { setUpNextPhase } from "../transition_handlers.js";
import { NOTIFICATION_MESSAGES } from "../configs/notification_config.js";
import { NOTIFICATION_TYPES } from "../configs/notification_config.js";
import {
  addListenerTroopSelector,
  displayTroopSelector,
  removeSkipButton,
  setTroopLimit,
} from "../utilities.js";

const opponentNeighbours = (player, territories, selectedTerritoryId) => {
  const neighbours = territories[selectedTerritoryId].neighbours;
  return neighbours.filter(
    (neighbour) => !player.territories.includes(neighbour),
  );
};

const isMyTerritory = (gameState, territoryId) => {
  return gameState.player.territories.includes(territoryId);
};

const selectAttackingTroops = (event, gameState, attacker, handleSelection) => {
  const troopCount = gameState.territories[attacker].troopCount;
  const maxTroops = Math.min(3, troopCount - 1);
  const minTroops = 1;

  setTroopLimit(maxTroops, minTroops, maxTroops);
  addListenerTroopSelector(handleSelection);
  displayTroopSelector(event);
};

const isNeighbouringOpponent = (gameState, selectedTerritoryId) => {
  if (!gameState.invadeDetials) return false;
  return gameState.invadeDetials.neighbours.includes(selectedTerritoryId);
};

const handleAttack = async (
  gameState,
  attackerTerritoryId,
  defenderTerritoryId,
  attackerTroops,
) => {
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

  removeSkipButton();
  removeHighlights("selected");
  setUpNextPhase(gameState, newState);
};

const selectAttacker = (gameState, selectedTerritoryId) => {
  removeHighlights("highlight", ".territory");
  const neighbours = opponentNeighbours(
    gameState.player,
    gameState.territories,
    selectedTerritoryId,
  );

  gameState.invadeDetials = { attacker: selectedTerritoryId, neighbours };

  highlightTerritories(neighbours, "highlight");
};

const selectDefender = (event, gameState, selectedTerritoryId) => {
  removeHighlights("highlight", ".territory");
  const attackerTerritoryId = gameState.invadeDetials.attacker;
  const defenderTerritoryId = selectedTerritoryId;
  gameState.invadeDetials.defender = defenderTerritoryId;

  const handleSelection = async (troopCount) =>
    await handleAttack(
      gameState,
      attackerTerritoryId,
      defenderTerritoryId,
      troopCount,
    );
  highlightTerritories([defenderTerritoryId], "higlight");
  selectAttackingTroops(event, gameState, attackerTerritoryId, handleSelection);
};

const hasEnemyNeighbour = (gameState, territoryId) =>
  gameState.territories[territoryId].neighbours.some(
    (neighbour) => !isMyTerritory(gameState, neighbour),
  );

const hasEnoughTroops = (gameState, territoryId) =>
  gameState.territories[territoryId].troopCount > 1;

const canAttackFrom = (gameState, territoryId) =>
  hasEnoughTroops(gameState, territoryId) &&
  hasEnemyNeighbour(gameState, territoryId);

const isAttackableTerritory = (gameState, territoryId) =>
  isMyTerritory(gameState, territoryId) &&
  canAttackFrom(gameState, territoryId);

export const handleInvasion = (territory, gameState, event) => {
  const selectedTerritoryId = Number(territory.dataset.territoryId);

  if (isAttackableTerritory(gameState, selectedTerritoryId)) {
    return selectAttacker(gameState, selectedTerritoryId);
  }

  if (isNeighbouringOpponent(gameState, selectedTerritoryId)) {
    return selectDefender(event, gameState, selectedTerritoryId);
  }

  showNotification(
    NOTIFICATION_MESSAGES.INVALID_TERRITORY,
    NOTIFICATION_TYPES.WARNING,
  );
};
