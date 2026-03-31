import { setupListeners } from "./setup_listeners.js";
import { renderTerritoriesAndTroops } from "./features/initial_territory_allocate.js";
import { getSetup } from "./server_calls.js";
import { SETUP_TRANSITION } from "./config.js";
import { renderCurrentPlayerName, renderGameState } from "./utilities.js";
import { setup } from "./features/setup.js";

globalThis.onload = async () => {
  const gameState = await getSetup();

  setupListeners(gameState);
  renderCurrentPlayerName(gameState);

  renderGameState(gameState.state);
  setup(gameState);

  if (gameState.state in SETUP_TRANSITION) {
    SETUP_TRANSITION[gameState.state](gameState);
  }

  renderTerritoriesAndTroops(
    gameState.player,
    gameState.territories,
    gameState.opponents,
  );
};
