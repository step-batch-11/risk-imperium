import { setup } from "./features/setup.js";
import { setupListeners } from "./setup_listeners.js";
import { renderTerritoriesAndTroops } from "./features/initial_territory_allocate.js";
import { getSetup } from "./server_calls.js";

globalThis.onload = async () => {
  const gameState = await getSetup();
  setupListeners(gameState);
  setup(gameState);
  renderTerritoriesAndTroops(
    gameState.player,
    gameState.territories,
    gameState.opponents,
  );
};
