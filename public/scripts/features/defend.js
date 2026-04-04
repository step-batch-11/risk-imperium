import { defend } from "../server_calls.js";
import {
  addListenerTroopSelector,
  displayTroopSelector,
  setTroopLimit,
} from "../utilities.js";
import {
  highlightTerritories,
  removeHighlights,
} from "../utilities/highlight.js";
import { handleCombat } from "./resolve_combat.js";

const defendTerritory = async (gameState, territoryId, troopCount) => {
  const defendData = { territoryId, troopCount };
  const { action, data } = await defend(defendData);
  gameState.state = action;
  await handleCombat(data, action, gameState);
  delete gameState.invadeDetials;
  removeHighlights("highlight");
};

const calculatePosition = (territory) => {
  const { left, right, top, bottom } = territory.getBoundingClientRect();
  const height = top + bottom;
  return { x: (left + right) / 2, y: top + height * 0.1 };
};

const setLimit = (gameState, defenderTerritoryId) => {
  const availableTroopCount =
    gameState.territories[defenderTerritoryId].troopCount;

  const maxTroops = Math.min(2, availableTroopCount);
  const minTroops = 1;
  setTroopLimit(maxTroops, minTroops, maxTroops);
};

export const handleDefense = (gameState) => {
  const defenderTerritoryId = gameState.invadeDetials.defender;
  const defendingTerritory = document.querySelector(
    `[data-territory-id="${defenderTerritoryId}"]`,
  );
  const attackerTerritoryId = gameState.invadeDetials.attacker;
  highlightTerritories([attackerTerritoryId], "selected");
  highlightTerritories([defenderTerritoryId], "highlight");

  const defendHandler = async (troopCount) =>
    await defendTerritory(gameState, defenderTerritoryId, troopCount);

  setLimit(gameState, defenderTerritoryId);

  const position = calculatePosition(defendingTerritory);
  const cancelDisabled = true;
  displayTroopSelector(position, cancelDisabled);
  addListenerTroopSelector(defendHandler);
};
