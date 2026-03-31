import { setupListeners } from "./setup_listeners.js";
import { renderTerritoriesAndTroops } from "./features/initial_territory_allocate.js";
import { getSetup } from "./server_calls.js";
import { SETUP } from "./config.js";

globalThis.onload = async () => {
  const gameState = await getSetup();
  setupListeners(gameState);

  if (gameState.state in SETUP) {
    SETUP[gameState.state](gameState);
  }

  renderTerritoriesAndTroops(
    gameState.player,
    gameState.territories,
    gameState.opponents,
  );
};
