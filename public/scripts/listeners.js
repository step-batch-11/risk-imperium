import { STATES } from "./configs/game_states.js";
import { STYLES } from "./configs/styles.js";
import {
  removeCardAreaListener,
  renderTradeIndicator,
  tradeCard,
} from "./features/cards.js";
import { updateCavalry } from "./features/cavalry_update.js";
import { onMapAction } from "./features/map_events.js";
import { updateCards } from "./features/setup.js";
import { setUpNextPhase } from "./transition_handlers.js";
import { setTroopLimit } from "./utilities.js";
import { showNotification } from "./utilities/notifications.js";
import { renderRemainingTroopsToDeploy } from "./utilities/render_UI.js";

export const addListenersToPlayerIcon = () => {
  const playerIcon = document.querySelector("#player-details-button");
  const playerDetailsDialog = document.querySelector(
    "#player-details-container",
  );

  playerIcon.addEventListener("click", () => {
    playerDetailsDialog.classList.toggle(STYLES.HIDDEN);
  });
};

export const setupListeners = (gameState) => {
  const map = document.querySelector("#map-svg");
  map.addEventListener("click", (e) => onMapAction(e, gameState));
};

export const addListenerToCardIcon = (player) => {
  const cardArea = document.querySelector("#card-area");
  const cardIcon = document.querySelector("#cards");

  updateCards(player.cards);

  cardIcon.addEventListener("click", () => {
    const alert = cardIcon.querySelector("circle");
    alert.classList.remove(STYLES.CARD_ALERT);
    cardArea.classList.toggle(STYLES.HIDDEN);
  });
};

const tradeSelectedCards = async (gameState, cards, closeDialoge) => {
  showNotification("Traded the card ");
  const selectedCards = Object.values(gameState.selectedCards);
  const selected = [...selectedCards];
  const { action, data } = await tradeCard(selected);
  gameState.cavalryPositions = data.positions;
  updateCavalry(data.positions);
  renderRemainingTroopsToDeploy(data.troops);
  setTroopLimit(data.troops);
  for (const card of selected) {
    const idx = cards.findIndex((c) => c === card);
    cards.splice(idx, 1);
  }

  if (cards.length < 5) {
    closeDialoge();
  }

  removeCardAreaListener(gameState);
  if (gameState.state === STATES.REINFORCE) renderTradeIndicator(gameState);
  setUpNextPhase(gameState, action);
  updateCards(cards);
  gameState.selectedCards = {};
};

export const addListenerToTrade = (
  gameState,
  trade = document.querySelector("#trade"),
  close = () => {},
) => {
  const cards = gameState.player.cards;
  trade.addEventListener(
    "click",
    (_) => tradeSelectedCards(gameState, cards, close),
  );
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
