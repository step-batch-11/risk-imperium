import { invade } from "../server_calls.js";
import { removeHighlights } from "../utilities/highlight.js";
import { showNotification } from "../utilities/notifications.js";
import { setUpNextPhase } from "../transition_handlers.js";
import { NOTIFICATION_MESSAGES } from "../configs/notification_config.js";
import { NOTIFICATION_TYPES } from "../configs/notification_config.js";
import {
  displayTroopSelector,
  removeSkipButton,
  setTroopLimit,
} from "../utilities.js";

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

const selectAttackingTroops = (event, gameState, attacker, handleSelection) => {
  const troopCount = gameState.territories[attacker].troopCount;
  const maxTroops = Math.min(3, troopCount - 1);
  const minTroops = 1;

  setTroopLimit(maxTroops, minTroops, maxTroops);
  displayTroopSelector(event, handleSelection);
};

const isNeighbouringOpponent = (gameState, selectedTerritoryId) => {
  if (!gameState.invadeDetials) return false;
  return gameState.invadeDetials.neighbours.includes(selectedTerritoryId);
};

const deleteInvadeDetails = (gameState) => {
  delete gameState.invadeDetials;
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
  deleteInvadeDetails(gameState);
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

  highlightTerritories(neighbours);
};

const selectDefender = (event, gameState, selectedTerritoryId) => {
  removeHighlights("highlight", ".territory");
  const handleSelection = async (troopCount) =>
    await handleAttack(
      gameState,
      attackerTerritoryId,
      defenderTerritoryId,
      troopCount,
    );

  const attackerTerritoryId = gameState.invadeDetials.attacker;
  const defenderTerritoryId = selectedTerritoryId;
  selectAttackingTroops(event, gameState, attackerTerritoryId, handleSelection);
};

const canAttack = (gameState, selectedTerritoryId) => {
  return gameState.territories[selectedTerritoryId].troopCount > 1;
};

const isAttackableTerritory = (gameState, territoryId) =>
  isMyTerritory(gameState, territoryId) && canAttack(gameState, territoryId);

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
