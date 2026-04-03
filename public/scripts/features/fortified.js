import { STATES } from "../configs/game_states.js";
import { getFortifiableTerritory } from "../handlers/fortified_handler.js";
import { fortifyRequest } from "../server_calls.js";
import { SETUP_TRANSITION, setUpNextPhase } from "../transition_handlers.js";
import { removeSkipButton, updateTroopsInTerritories } from "../utilities.js";
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

const handleFortifyTo = async (gameState, territory) => {
  const id = Number(territory.dataset.territoryId);

  gameState.fortifyTo = id;
  const fromId = gameState.fortifyFrom;
  const count = gameState.territories[fromId].troopCount - 1;
  const { action: nextPhase, data: updatedTerritories } = await fortifyRequest({
    from: fromId,
    to: id,
    count,
  });

  updateTroopsInTerritories(gameState, updatedTerritories);

  delete gameState.fortifyFrom;
  delete gameState.fortifyTo;

  return nextPhase;
};

export const handleFortified = async (territory, gameState) => {
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
    SETUP_TRANSITION[STATES.FORTIFICATION](gameState);
    return;
  }

  if (connectedTerritories.includes(gameState.fortifyFrom)) {
    const nextPhase = await handleFortifyTo(gameState, territory);
    removeHighlights("reinforce-from-selected");
    removeSkipButton();
    setUpNextPhase(gameState, nextPhase);
  }
};
