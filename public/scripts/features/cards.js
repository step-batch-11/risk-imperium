import { APIs } from "../configs/APIS.js";
import { USER_ACTIONS } from "../configs/user_action.js";
import { sendPostRequest } from "../server_calls.js";
// import { setUpNextPhase } from "../transition_handlers.js";
import { showNotification } from "../utilities/notifications.js";
import { addListenerToCard, updateCards } from "./setup.js";

export const addCardAlert = () => {
  const cardElement = document.querySelector("#cards");
  const circle = cardElement.querySelector("circle");
  circle.classList.add("card-alert");
};

export const getCard = async (gameState) => {
  const reqData = { userActions: USER_ACTIONS.GET_CARD, data: {} };

  const { action, data } = await sendPostRequest(APIs.USER_ACTIONS, reqData);
  if (data.card) {
    const player = gameState.player;
    player.cards.push(data.card);
    addCardAlert();

    updateCards(player.cards);
    showNotification(`${player.name} recieved a card`);
  }
  return action;
};

export const tradeCard = async (cards) => {
  const reqData = {
    userActions: USER_ACTIONS.TRADE_CARD,
    data: { cards },
  };
  const response = await sendPostRequest(APIs.USER_ACTIONS, reqData);

  return response.data;
};

const getCombinations = (arr, k = 3) => {
  const result = [];
  function backtrack(start, combo) {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      backtrack(i + 1, combo);
      combo.pop();
    }
  }

  backtrack(0, []);
  return result;
};

const isValidCombination = (combination = []) => {
  const set = new Set();
  combination.sort((a, b) => a - b);
  const allSame = combination.every((x) => {
    return combination[0] === x || x === "4";
  });
  combination.forEach((x) => {
    set.add(x);
  });
  const allDifferent = set.size === 3;

  return allDifferent || allSame;
};

export const canBeTraded = (selectedCard) => {
  const cards = Object.entries(selectedCard);
  const button = document.querySelector("#card-area button");
  if (cards.length === 3) {
    const isValid = isValidCombination(cards.map(([_, card]) => card));
    if (isValid) {
      button.removeAttribute("disabled");
      return;
    }
  }

  button.setAttribute("disabled", true);
};

export const canTradeCards = (cards) => {
  const validCombo = getCombinations(cards).filter(isValidCombination);
  return validCombo.length > 0;
};

export const renderTradeIndicator = (gameState) => {
  const cardArea = document.querySelector("#card-area");
  addListenerToCard(gameState, cardArea);
  const cards = gameState.player.cards;

  if (canTradeCards(cards)) {
    const cardIcon = document.querySelector("#cards");
    cardIcon.classList.add("highlight-card-icon");
  }
};

export const removeCardAreaListener = (gameState) => {
  const cardArea = document.querySelector("#card-area");
  const button = document.querySelector("#card-area button");
  const cardIcon = document.querySelector("#cards");
  cardIcon.classList.remove("highlight-card-icon");
  cardArea.onclick = () => {};
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => card.classList.remove("glow"));
  button.setAttribute("disabled", true);

  gameState.selectedCard = {};
};
