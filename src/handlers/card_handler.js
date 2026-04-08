import { STATES } from "../config.js";

export const tradeCardHandler = (game, userData) => {
  const cards = userData.cards;

  const data = game.tradeCard(cards);
  const action = game.getGameState();

  return { action, data };
};

export const getCardHandler = (game) => {
  let card;
  if (game.canGetCard) {
    card = game.getCard();
  }
  game.passToNextPlayer();

  const action = STATES.WAITING;

  const currentPlayerId = game.activePlayerId;
  return { action, data: { card, currentPlayerId } };
};
