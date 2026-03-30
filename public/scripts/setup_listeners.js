import { onMapAction } from "./features/map_events.js";

export const setupListeners = () => {
  const map = document.querySelector("#game");
  map.addEventListener("click", onMapAction);
};
