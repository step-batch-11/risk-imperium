import {
  displayRemainingTroopsToDisplay,
  showNotification,
} from "../utilities.js";
import { handleInitialReinforcement } from "./reinforce.js";
import { handleInvasion } from "./invasion.js";
const GAME_STATES = {
  INITIAL_REINFORCEMENT: handleInitialReinforcement,
  INVASION: handleInvasion,
};

export const onMapAction = async (event, gameState) => {
  const territory = event.target.closest(".territory");
  if (!territory) return;
  if (gameState.state in GAME_STATES) {
    const stateToPerform = GAME_STATES[gameState.state];
    const result = await stateToPerform(territory, gameState);
    const { message, status, remainingTroopsToDeploy } = result;

    if (remainingTroopsToDeploy !== undefined) {
      displayRemainingTroopsToDisplay(remainingTroopsToDeploy);
    }

    showNotification(message, status);
  }
};
