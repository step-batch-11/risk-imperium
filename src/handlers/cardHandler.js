export const tradeCardHandler = (game, userData) => {
  const cards = userData.cards;
  const data = game.tradeCard(cards);
  const action = game.getGameState();

  return { action, data };
};
