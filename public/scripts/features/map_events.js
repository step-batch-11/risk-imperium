import { handleDefend } from "./defend.js";
import { initialReinforcement, reinforce } from "./reinforce.js";
import { handleInvasion } from "./invasion.js";
import { STATES } from "../config.js";

const GAME_STATES = {
  [STATES.INITIAL_REINFORCEMENT]: initialReinforcement,
  [STATES.REINFORCE]: reinforce,
  [STATES.INVASION]: handleInvasion,
  [STATES.DEFEND]: handleDefend,
};

export const onMapAction = (event, gameState) => {
  const territory = event.target.closest(".territory");
  if (!territory) return;

  if (gameState.state in GAME_STATES) {
    const stateToPerform = GAME_STATES[gameState.state];
    stateToPerform(territory, gameState);
  }
};
