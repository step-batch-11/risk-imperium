import { LABELS } from "../configs/label.js";
import { defend } from "../server_calls.js";
import { setUpNextPhase } from "../transition_handlers.js";
import {
  addListenerTroopSelector,
  displayTroopSelector,
  setTroopLimit,
} from "../utilities.js";
import {
  highlightTerritories,
  removeHighlights,
} from "../utilities/highlight.js";

const defendTerritory = async (gameState, territoryId, troopCount) => {
  const defendData = { territoryId, troopCount };
  const { action } = await defend(defendData);

  delete gameState.invadeDetails;
  removeHighlights("highlight");
  setUpNextPhase(gameState, action);
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
  const defenderTerritoryId = gameState.invadeDetails.defenderTerritoryId;
  const defendingTerritory = document.querySelector(
    `[data-territory-id="${defenderTerritoryId}"]`,
  );
  const attackerTerritoryId = gameState.invadeDetails.attackerTerritoryId;
  highlightTerritories([attackerTerritoryId], "selected");
  highlightTerritories([defenderTerritoryId], "highlight");

  const defendHandler = async (troopCount) =>
    await defendTerritory(gameState, defenderTerritoryId, troopCount);

  setLimit(gameState, defenderTerritoryId);

  const position = calculatePosition(defendingTerritory);
  const cancelDisabled = true;
  displayTroopSelector(position, LABELS.DEFEND, cancelDisabled);
  addListenerTroopSelector(defendHandler);
};
