import { handleDefend } from "./defend.js";
import {
  handleInitialReinforcement,
  handleReinforcement,
} from "./reinforce.js";
import { handleInvasion } from "./invasion.js";
import { STATES } from "../config.js";

const GAME_STATES = {
  [STATES.INITIAL_REINFORCEMENT]: handleInitialReinforcement,
  [STATES.REINFORCE]: handleReinforcement,
  [STATES.INVASION]: handleInvasion,
  [STATES.DEFEND]: handleDefend,
};

export const onMapAction = async (event, gameState) => {
  const territory = event.target.closest(".territory");
  if (!territory) return;

  if (gameState.state in GAME_STATES) {
    const stateToPerform = GAME_STATES[gameState.state];
    await stateToPerform(territory, gameState);
  }
};
