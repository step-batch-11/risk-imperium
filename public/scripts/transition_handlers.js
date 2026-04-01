import { APIs } from "./configs/APIS.js";
import { sendPostRequest } from "./server_calls.js";
import { setTroopLimit } from "./utilities.js";
import { USER_ACTIONS } from "./configs/user_action.js";

import { renderRemainingTroopsToDeploy } from "./utilities/render_UI.js";
import {
  highlightTerritories,
  removeHighlights,
} from "./utilities/highlight.js";

const setupReinforcePhase = async (gameState) => {
  const { data } = await sendPostRequest(APIs.USER_ACTIONS, {
    userActions: USER_ACTIONS.SETUP,
  });

  const territories = gameState.player.territories;
  setTroopLimit(data.troopsToReinforce);
  renderRemainingTroopsToDeploy(data.troopsToReinforce);
  highlightTerritories(territories);
};

const setupInvasionPhase = (gameState) => {
  const territoryIds = gameState.player.territories;
  const attackableTerritories = territoryIds.filter((territoryId) => {
    return gameState.territories[territoryId].troopCount > 1;
  });

  removeHighlights("selected");
  highlightTerritories(attackableTerritories);
};

export const SETUP_TRANSITION = {
  REINFORCE: setupReinforcePhase,
  INVASION: setupInvasionPhase,
};

export const setUpNextPhase = (gameState, nextState) => {
  if (gameState.state === nextState) {
    return;
  }

  gameState.state = nextState;
  if (nextState in SETUP_TRANSITION) {
    return SETUP_TRANSITION[nextState](gameState);
  }
};
