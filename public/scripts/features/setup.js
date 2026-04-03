import { NOTIFICATION_TYPES } from "../configs/notification_config.js";
import { addListenersToPlayerIcon } from "../listeners.js";
import { getAllPlayersDetail, getOwnedContinents } from "../utilities.js";
import { showNotification } from "../utilities/notifications.js";
import { canBeTraded } from "./cards.js";

const renderPlayerDetails = (player, continents) => {
  const playerDetailsTemplate = document.querySelector(
    "#single-player-detail-template",
  );
  const clone = playerDetailsTemplate.content.cloneNode(true);
  const playerDetailsContainer = clone.querySelector(".player-deatils");

  playerDetailsContainer.dataset.playerId = player.id;

  const nameElement = clone.querySelector(".name");

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

export const addListenerToCard = (gameState, cardArea) => {
  cardArea.onclick = (e) => {
    const id = e.target.id;
    const list = e.target.classList;

    if (!list.contains("card")) return;

    const cardId = +id.split("-")[1];

    const card = cardArea.querySelector(`#${id}`);
    const cards = gameState.player.cards;
    const selectedCards = gameState.selectedCards;
    if (selectedCards[id]) {
      delete selectedCards[id];
      card.classList.remove("glow");
      canBeTraded(gameState.selectedCards);
      return;
    }

    if (Object.entries(selectedCards).length === 3) {
      showNotification(
        "deselect to select all cards",
        NOTIFICATION_TYPES.WARNING,
      );
      return;
    }

    gameState.selectedCards[id] = cards[cardId];
    card.classList.add("glow");
    canBeTraded(gameState.selectedCards);
  };
};

export const updateCards = (cards) => {
  const cardsArea = document.querySelector("#card-area > div");
  cardsArea.textContent = "";
  const cardElements = cards.map((card, i) => {
    const cardElement = document.createElement("div");
    cardElement.textContent = card;
    cardElement.classList.add("card");
    cardElement.id = `card-${i}`;
    return cardElement;
  });

  cardsArea.append(...cardElements);
};
