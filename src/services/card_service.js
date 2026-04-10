import { STATES } from "../config.js";

export const validateCardCombination = (game, cards) => {
  const isValidCombo = game.isValidCombination(cards);
  const isPlayerCards = game.isPlayerCards(cards);

  if (!isValidCombo || !isPlayerCards) {
    throw new Error("INVALID CARDS COMBO");
  }
};

export const tradeCardService = (game, userData) => {
  const cards = userData.cards;

  validateCardCombination(game, cards);
  game.setNewState(STATES.REINFORCE);

  const troops = game.getCavalryTroops();
  game.addReinforcementTroops(troops);
  const remaining = game.stateDetails.remainingTroopsCount;

  game.removePlayerCards(cards);
  game.moveCavalry();
  const positions = game.cavalryPositions;

  game.updateGame(
    STATES.TRADE_CARD,
    {
      playerId: game.activePlayerId,
      cavalryPositions: positions,
      troopsLeft: remaining,
    },
    game.activePlayerId,
  );

  const data = { troops: remaining, positions };

  const action = game.getGameState();

  return { action, data };
};

export const getCardService = (game) => {
  let card;

  if (game.hasCaptured) {
    card = game.getCard();
  }

  game.passToNextPlayer();
  game.hasCaptured = false;

  const action = STATES.WAITING;

  const currentPlayerId = game.activePlayerId;
  return { action, data: { card, currentPlayerId } };
};
