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
import { LABELS } from "../configs/label.js";

const opponentNeighbours = (player, territories, selectedTerritoryId) => {
  const neighbours = territories[selectedTerritoryId].neighbours;
  return neighbours.filter(
    (neighbour) => !player.territories.includes(neighbour),
  );
};

const isMyTerritory = (gameState, territoryId) => {
  return gameState.player.territories.includes(territoryId);
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

const isNeighbouringOpponent = (gameState, selectedTerritoryId) => {
  if (!gameState.invadeDetials) return false;
  return gameState.invadeDetials.neighbours.includes(selectedTerritoryId);
};

const selectAttackingTroops = (event, gameState, attacker, handleSelection) => {
  const troopCount = gameState.territories[attacker].troopCount;
  const maxTroops = Math.min(3, troopCount - 1);
  const minTroops = 1;

  setTroopLimit(maxTroops, minTroops, maxTroops);
  addListenerTroopSelector(handleSelection);
  displayTroopSelector(event, LABELS.INVASION);
};

export const highlightPotentialAttackers = (gameState) => {
  removeHighlights("can-attack");

  const potentialAttackers = gameState.player.territories.filter((
    territoryId,
  ) => canAttackFrom(gameState, territoryId));

  highlightTerritories(potentialAttackers, "can-attack");
};

const selectAttacker = (gameState, selectedTerritoryId) => {
  removeHighlights("selected");
  removeHighlights("target");

  const neighbours = opponentNeighbours(
    gameState.player,
    gameState.territories,
    selectedTerritoryId,
  );

  gameState.invadeDetials = { attacker: selectedTerritoryId, neighbours };

  highlightTerritories([selectedTerritoryId], "selected");
  highlightTerritories(neighbours, "target");
};

const selectDefender = (event, gameState, selectedTerritoryId) => {
  removeHighlights("target");

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

  highlightTerritories([defenderTerritoryId], "target");
  selectAttackingTroops(event, gameState, attackerTerritoryId, handleSelection);
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
    NOTIFICATION_MESSAGES.WAIT_FOR_DEFENDER,
    NOTIFICATION_TYPES.INFO,
    5000,
  );

  removeSkipButton();
  removeHighlights("selected");
  removeHighlights("target");
  removeHighlights("can-attack");

  setUpNextPhase(gameState, newState);
};

export const handleInvasion = (territory, gameState, event) => {
  const selectedTerritoryId = Number(territory.dataset.territoryId);

  if (isAttackableTerritory(gameState, selectedTerritoryId)) {
    return selectAttacker(gameState, selectedTerritoryId);
  }

  if (isNeighbouringOpponent(gameState, selectedTerritoryId)) {
    return selectDefender(event, gameState, selectedTerritoryId);
  }

  removeHighlights("selected");
  removeHighlights("target");
  highlightPotentialAttackers(gameState);

  showNotification(
    NOTIFICATION_MESSAGES.INVALID_TERRITORY,
    NOTIFICATION_TYPES.WARNING,
  );
};
