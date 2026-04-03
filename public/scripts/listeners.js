import {
  removeCardAreaListener,
  renderTradeIndicator,
} from "./features/cards.js";
import { onMapAction } from "./features/map_events.js";
import { updateCards } from "./features/setup.js";
import { showNotification } from "./utilities/notifications.js";

export const addListenersToPlayerIcon = () => {
  const playerIcon = document.querySelector("#player-details-button");
  const playerDetailsDialog = document.querySelector(
    "#player-details-container",
  );

  const closeButton = document.querySelector(
    "#player-details-container > button",
  );

  playerIcon.addEventListener("click", () => {
    playerDetailsDialog.classList.toggle("hidden");
  });

  closeButton.addEventListener("click", () => {
    playerDetailsDialog.classList.toggle("hidden");
  });
};

export const setupListeners = (gameState) => {
  const map = document.querySelector("#game");
  map.addEventListener("click", (e) => onMapAction(e, gameState));
};

export const addListenerToCardIcon = (player) => {
  const cardArea = document.querySelector("#card-area");
  const cardIcon = document.querySelector("#cards");

  updateCards(player.cards);

  cardIcon.addEventListener("click", () => {
    const alert = cardIcon.querySelector("circle");
    alert.classList.remove("card-alert");
    cardArea.classList.toggle("hidden");
  });
};

export const addListnerToTrade = (gameState) => {
  const trade = document.querySelector("#card-area button");
  const cards = gameState.player.cards;
  trade.addEventListener("click", () => {
    showNotification("Traded the card ");

    const selectedCards = Object.values(gameState.selectedCards);
    for (const card of selectedCards) {
      const idx = cards.findIndex((c) => c === card);
      cards.splice(idx, 1);
    }
    removeCardAreaListener(gameState);
    renderTradeIndicator(gameState);

    updateCards(cards);
    gameState.selectedCards = {};
  });
};
const isValidTroopCount = (value, max) => value > 0 && value <= max;

const updateTroopCount = (input, offset) => {
  const currentTroopsCount = Number(input.value);
  const maxLimit = Number(input.max);

  const updatedTroopsCount = currentTroopsCount + offset;

  if (isValidTroopCount(updatedTroopsCount, maxLimit)) {
    input.value = updatedTroopsCount;
  }
};

export const setupDeployControls = (dialog) => {
  const input = dialog.querySelector("#troop-count-input");

  dialog.querySelector("#increase-troops-btn").onclick = () =>
    updateTroopCount(input, +1);

  dialog.querySelector("#decrease-troops-btn").onclick = () =>
    updateTroopCount(input, -1);

  dialog.querySelector("#cancel-deploy-btn").onclick = () => dialog.close();
};
