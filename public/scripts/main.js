import { setupListeners } from "./setup_listeners.js";

globalThis.onload = () => {
  setupListeners();
};
