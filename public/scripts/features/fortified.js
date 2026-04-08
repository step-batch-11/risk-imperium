import { STATES } from "../configs/game_states.js";
import { getFortifiableTerritory } from "../handlers/fortified_handler.js";
import { fortifyRequest } from "../server_calls.js";
import { SETUP_TRANSITION, setUpNextPhase } from "../transition_handlers.js";
import {
  addListenerTroopSelector,
  displayTroopSelector,
  removeSkipButton,
  setTroopLimit,
  updateTroopsInTerritories,
} from "../utilities.js";
import {
  highlightTerritories,
  removeHighlights,
} from "../utilities/highlight.js";

const handleFortifyTerritoryFromSelection = (gameState, territory) => {
  const id = Number(territory.dataset.territoryId);
  const territoriesSets = getFortifiableTerritory(gameState);
  const connectedTerritories = territoriesSets.find((set) => set.includes(id));

  if (gameState.territories[id].troopCount < 2) {
    return;
  }

  const territoriesToMoveTo = connectedTerritories.filter((tid) => tid !== id);
  highlightTerritories([id], "reinforce-from-selected");
  removeHighlights("selected");
  highlightTerritories(territoriesToMoveTo);
  gameState.fortifyFrom = id;
};

const handleFortification = async (_event, gameState, fromId, id, count) => {
  const { action: nextPhase, data } = await fortifyRequest({
    from: fromId,
    to: id,
    count,
  });

  updateTroopsInTerritories(gameState, data.updatedTerritories);

  delete gameState.fortifyFrom;
  delete gameState.fortifyTo;

  removeSkipButton();
  setUpNextPhase(gameState, nextPhase);
};

const selectFortifyingTroops = (event, gameState, fromId, handleSelection) => {
  const troopCount = gameState.territories[fromId].troopCount;
  const maxTroops = troopCount - 1;
  const minTroops = 1;

  setTroopLimit(maxTroops, minTroops, maxTroops);
  addListenerTroopSelector(handleSelection);
  displayTroopSelector(event);
};

const handleFortifyTo = (event, gameState, territory) => {
  const id = Number(territory.dataset.territoryId);

  gameState.fortifyTo = id;
  const fromId = gameState.fortifyFrom;

  const handleSelection = async (troopCount) =>
    await handleFortification(event, gameState, fromId, id, troopCount);

  selectFortifyingTroops(event, gameState, fromId, handleSelection);
};

export const handleFortified = (territory, gameState, event) => {
  const id = Number(territory.dataset.territoryId);
  const territoriesSets = getFortifiableTerritory(gameState);
  const connectedTerritories = territoriesSets.find((set) => set.includes(id));

  if (!connectedTerritories) {
    return;
  }

  if (!gameState.fortifyFrom) {
    handleFortifyTerritoryFromSelection(gameState, territory);
    return;
  }

  if (id === gameState.fortifyFrom) {
    delete gameState.fortifyFrom;
    removeHighlights("reinforce-from-selected");
    removeHighlights("selected");
    removeSkipButton();
    SETUP_TRANSITION[STATES.FORTIFICATION](gameState);
    return;
  }

  if (connectedTerritories.includes(gameState.fortifyFrom)) {
    handleFortifyTo(event, gameState, territory);
    removeHighlights("reinforce-from-selected");
  }
};
