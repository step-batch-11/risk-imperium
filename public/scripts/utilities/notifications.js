import { descendingSort, getTerritoryName } from "../utilities.js";
import { displayDiceAnimations } from "./animate_dice.js";

let notifyTimer;

export const showNotification = (message, type = "info", duration = 2000) => {
  const notification = document.querySelector("#notification-container");
  notification.className = `notification ${type}`;
  const paragraph = notification.querySelector("#notification-text");
  paragraph.textContent = message;

  clearTimeout(notifyTimer);

  notifyTimer = setTimeout(() => {
    notification.classList.remove(type);
  }, duration);
};

export const initialReinforcementMsg = (gameState, player, data) => {
  const territoryId = data.updatedTerritory[0].territoryId;
  const territory = getTerritoryName(gameState, territoryId);

  return `${player} deployed 1 troop to ${territory}!`;
};

export const reinforcementMsg = (gameState, player, data) => {
  const { territoryId, troopCount } = data;
  const territory = getTerritoryName(gameState, territoryId);

  return `${player} reinforced ${territory} with ${troopCount} troop(s)!`;
};

export const invasionMsg = (gameState, player, data) => {
  const { attackerTerritoryId, attackerTroops, defenderTerritoryId } = data;

  const fromTerritory = getTerritoryName(gameState, attackerTerritoryId);
  const toTerritory = getTerritoryName(gameState, defenderTerritoryId);

  return `${player} initiates battle at ${toTerritory} from ${fromTerritory} with ${attackerTroops} troop(s)!`;
};

export const defendMsg = (gameState, player, data) => {
  const { defenderId, defenderTroopCount } = data;
  const defender = gameState.opponents[defenderId].name;

  return `${defender} is defending against ${player} with ${defenderTroopCount} troop(s)`;
};

const calculateWins = (attackerDice, defenderDice) => {
  const attackerValues = descendingSort(attackerDice).slice(
    defenderDice.length,
  );
  const defenderValues = descendingSort(defenderDice).slice(
    attackerDice.length,
  );

  return attackerValues.reduce(
    (wins, attackerValue, i) =>
      attackerValue > defenderValues[i] ? wins + 1 : wins,
    0,
  );
};

export const resolveCombatMsg = (gameState, player, data) => {
  const { invadeDetails, defenderId, hasCaptured } = data;
  const { attackerDice, defenderDice, defenderTerritoryId } = invadeDetails;

  const territory = getTerritoryName(gameState, defenderTerritoryId);
  const defender = gameState.opponents[defenderId].name;

  displayDiceAnimations(attackerDice, defenderDice);

  if (hasCaptured) {
    return `${player} conquers ${territory}!`;
  }

  const wins = calculateWins(attackerDice, defenderDice);

  if (wins === attackerDice.length) {
    return `${player} wins the battle at ${territory}!`;
  }

  if (wins === 0) {
    return `${defender} has defended ${territory}`;
  }

  return `Stalemate at ${territory} — no ground gained!`;
};

export const moveInMsg = (gameState, player, data) => {
  const { from, to, troopCount } = data;
  const fromTerritory = getTerritoryName(gameState, from);
  const toTerritory = getTerritoryName(gameState, to);

  return `${player} advances ${troopCount} troop(s) from ${fromTerritory} to ${toTerritory}!`;
};

export const skipInvasionMsg = (_gameState, player) =>
  `${player} holds position, choosing not to strike in this turn`;

export const fortificationMsg = (gameState, player, data) => {
  const { from, to, troopCount } = data;
  const fromTerritory = getTerritoryName(gameState, from);
  const toTerritory = getTerritoryName(gameState, to);

  return `${player} fortifies ${toTerritory} with ${troopCount} troop(s) from ${fromTerritory}!`;
};

export const skipFortificationMsg = (_gameState, player) =>
  `${player} holds position, choosing not to fortify this turn!`;

export const getCardMsg = (_gameState, player) => `${player} gains a card!`;

export const tradeCardMsg = (_gameState, player) =>
  `${player} trades cards for reinforcements!`;
