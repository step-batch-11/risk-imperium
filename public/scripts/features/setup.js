import {
  NOTIFICATION_MESSAGES,
  NOTIFICATION_TYPES,
} from "../configs/notification_config.js";
import { STYLES } from "../configs/styles.js";
import { TERRITORY_CARD } from "../configs/territory_card.js";
import { addListenersToPlayerIcon } from "../listeners.js";
import { createAvatar } from "../lobby/lobby.js";
import { getAllPlayersDetail, getOwnedContinents } from "../utilities.js";
import { addGlow } from "../utilities/highlight.js";
import { showNotification } from "../utilities/notifications.js";
import { canBeTraded } from "./cards.js";

const renderPlayerDetails = (player, continents) => {
  const playerDetailsTemplate = document.querySelector(
    "#single-player-detail-template",
  );
  const clone = playerDetailsTemplate.content.cloneNode(true);
  const playerDetailsContainer = clone.querySelector(".player-details");

  playerDetailsContainer.dataset.player = player.colorId;

  const nameElement = clone.querySelector(".name");
  const avatarElement = clone.querySelector(".avatar");
  const avatar = createAvatar(player.avatar);
  avatarElement.appendChild(avatar);
  nameElement.textContent = player.name;

  const territoryCountElement = clone.querySelector(".territory-count");
  const territoryCount = player.territories.length;
  territoryCountElement.textContent = `Territories : ${territoryCount}`;

  const continentsCountElement = clone.querySelector(".continent-count");
  const ownedContinents = getOwnedContinents(player, continents);

  continentsCountElement.textContent = `Continents : ${ownedContinents.length}`;
  return clone;
};

export const renderPlayersDetails = (gameState) => {
  const playerDetailsDialog = document.querySelector("#players-info");

  const players = getAllPlayersDetail(gameState.player, gameState.opponents);

  const allPlayersDetails = Object.values(players).map((player) =>
    renderPlayerDetails(player, gameState.continents)
  );

  playerDetailsDialog.replaceChildren();
  playerDetailsDialog.append(...allPlayersDetails);
  return players;
};

export const setup = (gameState) => {
  const players = renderPlayersDetails(gameState);
  addListenersToPlayerIcon(players, gameState.continents);
};

export const addListenerToCard = (gameState, cardContainer) => {
  const cardArea = cardContainer.querySelector("div");
  cardArea.onclick = (e) => {
    const id = e.target.id;
    const cardElement = e.target.closest(".card");

    if (!cardElement) return;

    const cardId = +id.split("-")[1];
    const card = cardArea.querySelector(`#${id}`);
    const cards = gameState.player.cards;
    const selectedCards = gameState.selectedCards;

    if (selectedCards[id]) {
      delete selectedCards[id];
      card.className = "";
      card.className = STYLES.CARD;
      addGlow(cardContainer, selectedCards, STYLES.GLOW);
      return;
    }

    if (Object.entries(selectedCards).length === 3) {
      showNotification(
        NOTIFICATION_MESSAGES.DESELECT_CARD,
        NOTIFICATION_TYPES.WARNING,
      );
      return;
    }

    gameState.selectedCards[id] = cards[cardId];

    card.classList.add(STYLES.GLOW);
    canBeTraded(gameState.selectedCards, cardContainer);
  };
};

const createCardElement = (card, i) => {
  const cardElement = document.createElement("div");
  cardElement.dataset.cardType = TERRITORY_CARD[card];
  cardElement.classList.add("card");
  cardElement.id = `card-${i}`;
  return cardElement;
};

export const updateCards = (cards, id = "#card-area") => {
  const cardsArea = document.querySelector(`${id} > div`);
  const fragment = document.createDocumentFragment();
  cards.forEach((card, i) => fragment.appendChild(createCardElement(card, i)));
  cardsArea.replaceChildren(fragment);
};
