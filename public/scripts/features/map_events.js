import { handleInitialReinforcement } from "./reinforce.js";

const GAME_STATES = {
  INITIAL_REINFORCEMENT: handleInitialReinforcement,
};

export const onMapAction = async (event, gameState) => {
  const territory = event.target.closest(".territory");

  if (gameState.state in GAME_STATES) {
    const stateToPerform = GAME_STATES[gameState.state];
    await stateToPerform(territory, gameState);
  }
};
