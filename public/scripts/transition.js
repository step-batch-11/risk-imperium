import { APIs } from "./APIS.js";
import { sendPostRequest } from "./server_calls.js";
import {
  displayRemainingTroopsToDeploy,
  highlightTerritories,
  removeHighlights,
} from "./utilities.js";

export const setTroopLimit = (maxTroops) => {
  const input = document.querySelector("#troop-count-input");
  input.max = maxTroops;
  input.min = 1;
};

export const setupReinforcePhase = async (gameState) => {
  const { data } = await sendPostRequest(APIs.USER_ACTIONS, {
    userActions: "SETUP",
  });

  const territories = gameState.player.territories;
  setTroopLimit(data.troopsToReinforce);
  displayRemainingTroopsToDeploy(data.troopsToReinforce);
  highlightTerritories(territories);
};

export const setupInvasionPhase = (gameState) => {
  const territoryIds = gameState.player.territories;
  const attackableTerritories = territoryIds.filter((territoryId) => {
    return gameState.territories[territoryId].troopCount > 1;
  });

  removeHighlights("selected");
  highlightTerritories(attackableTerritories);
};
