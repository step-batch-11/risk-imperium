import {
  addListenerToCardIcon,
  addListenerToTrade,
  setupListeners,
} from "./listeners.js";
import { renderTerritoriesAndTroops } from "./features/initial_territory_allocate.js";
import { getSetup } from "./server_calls.js";
import { SETUP_TRANSITION } from "./transition_handlers.js";
import {
  renderCurrentPlayerName,
  renderGameState,
} from "./utilities/render_UI.js";
import { setup } from "./features/setup.js";

globalThis.onload = async () => {
  const gameState = await getSetup();
  gameState.selectedCards = {};
  setupListeners(gameState);
  renderCurrentPlayerName(gameState);
  renderGameState(gameState);
  setup(gameState);
  addListenerToTrade(gameState);
  addListenerToCardIcon(gameState.player);

  if (gameState.state in SETUP_TRANSITION) {
    SETUP_TRANSITION[gameState.state](gameState);
  }

  renderTerritoriesAndTroops(
    gameState.player,
    gameState.territories,
    gameState.opponents,
  );
};
