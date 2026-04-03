import { APIs } from "../configs/APIS.js";
import { USER_ACTIONS } from "../configs/user_action.js";
import { sendPostRequest } from "../server_calls.js";
import { setUpNextPhase } from "../transition_handlers.js";
import { showNotification } from "../utilities/notifications.js";
import { updateCards } from "./setup.js";

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

  setUpNextPhase(gameState, action);
};
