import { onMapAction } from "./map_actions.js";

export const setupListeners = () => {
  const map = document.querySelector("#game");
  map.addEventListener("click", onMapAction);
}