import { onMapAction } from "./features/map_events.js";

export const setupListeners = (gameState) => {
  const map = document.querySelector("#game");
  map.addEventListener("click", (e) => onMapAction(e, gameState));
};
