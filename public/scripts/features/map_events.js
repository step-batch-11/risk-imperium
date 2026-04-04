// import { handleDefend } from "./defend.js";
import { initialReinforcement, reinforce } from "./reinforce.js";
import { handleInvasion } from "./invasion.js";
import { STATES } from "../configs/game_states.js";
import { handleFortified } from "./fortified.js";

const GAME_STATES = {
  [STATES.INITIAL_REINFORCEMENT]: initialReinforcement,
  [STATES.REINFORCE]: reinforce,
  [STATES.INVASION]: handleInvasion,
  // [STATES.DEFEND]: handleDefend,
  [STATES.FORTIFICATION]: handleFortified,
};

const hideCards = () => {
  const cardArea = document.querySelector("#card-area");
  if (!cardArea.classList.contains("hidden")) {
    cardArea.classList.toggle("hidden");
  }
};

export const onMapAction = (event, gameState) => {
  const territory = event.target.closest(".territory");
  hideCards();
  if (!territory) return;

  if (gameState.state in GAME_STATES) {
    const stateToPerform = GAME_STATES[gameState.state];
    stateToPerform(territory, gameState, event);
  }
};
