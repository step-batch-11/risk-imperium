import { APIs } from "../configs/APIS.js";
import { STYLES } from "../configs/styles.js";
import { USER_ACTIONS } from "../configs/user_action.js";
import { sendPostRequest } from "../server_calls.js";
import { addGlow } from "../utilities/highlight.js";
import { showNotification } from "../utilities/notifications.js";
import { renderCurrentPlayerName } from "../utilities/render_UI.js";
import { forceTrade } from "./force_trade.js";
import { addListenerToCard, updateCards } from "./setup.js";

export const addCardAlert = () => {
  const cardElement = document.querySelector("#cards");
  const circle = cardElement.querySelector("circle");
  circle.classList.add(STYLES.CARD_ALERT);
};

export const getCard = async (gameState) => {
  const reqData = { userActions: USER_ACTIONS.GET_CARD, data: {} };

  const { action, data } = await sendPostRequest(APIs.USER_ACTIONS, reqData);

  if (data.card) {
    const player = gameState.player;
    player.cards.push(data.card);
    addCardAlert();

    updateCards(player.cards);
    showNotification(`${player.name} received a card`);
  }

  gameState.currentPlayer = data.currentPlayerId;
  renderCurrentPlayerName(gameState);
  return action;
};

export const tradeCard = async (cards) => {
  const reqData = {
    userActions: USER_ACTIONS.TRADE_CARD,
    data: { cards },
  };
  const response = await sendPostRequest(APIs.USER_ACTIONS, reqData);
  return response;
};

const isValidCombination = (combination = []) => {
  const set = new Set();
  combination.sort((a, b) => a - b);

  const allSame = combination.every((x) => combination[0] === x || x === "4");

  combination.forEach((x) => {
    set.add(x);
  });
  const allDifferent = set.size === 3;

  return allDifferent || allSame;
};

const canTradeCards = (arr, k = 3) => {
  const backtrack = (start, combo) => {
    if (combo.length === k) {
      return isValidCombination(combo);
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      if (backtrack(i + 1, combo)) return true;
      combo.pop();
    }
    return false;
  };
  return backtrack(0, []);
};

export const canBeTraded = (selectedCard, cardContainer) => {
  const cards = Object.entries(selectedCard);
  const button = cardContainer.querySelector("button");

  if (cards.length === 3) {
    const isValid = isValidCombination(cards.map(([_, card]) => card));

    if (isValid) {
      addGlow(cardContainer, selectedCard, "glow-correct");
      button.removeAttribute("disabled");
      return;
    }
    addGlow(cardContainer, selectedCard, "glow-wrong");
  }

  button.setAttribute("disabled", true);
};

export const renderTradeIndicator = (gameState) => {
  const cardArea = document.querySelector("#card-area");
  const cards = gameState.player.cards;
  if (cards.length > 4) {
    return forceTrade(gameState);
  }
  addListenerToCard(gameState, cardArea);
  if (canTradeCards(cards)) {
    const cardIcon = document.querySelector("#cards");
    cardIcon.classList.add(STYLES.HIGHLIGHT_CARD_ICON);
  }
};

export const removeCardAreaListener = (gameState, id = "#card-area") => {
  const cardContainer = document.querySelector(`${id}`);
  const cardArea = cardContainer.querySelector("div");
  const button = cardContainer.querySelector("button");
  const cardIcon = document.querySelector("#cards");
  cardIcon.classList.remove(STYLES.HIGHLIGHT_CARD_ICON);
  cardArea.onclick = () => {};
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => (card.className = STYLES.CARD));
  button.setAttribute("disabled", true);

  gameState.selectedCard = {};
};
