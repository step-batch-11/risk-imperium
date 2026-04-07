import { STATES } from "../config.js";
import { sendDataToPlayer, sendUpdatesToPlayers } from "../utilities.js";

export const tradeCardHandler = (
  game,
  userData,
  _currentPlayerId,
  opponents,
) => {
  const cards = userData.cards;

  const data = game.tradeCard(cards);
  const action = game.getGameState();
  const lastUpdate = game.lastUpdate;

  sendUpdatesToPlayers(STATES.WAITING, lastUpdate, opponents);

  return { action, data };
};

export const getCardHandler = (game, _data, _currentPlayerId, opponents) => {
  let card;
  if (game.canGetCard) {
    card = game.getCard();
  }

  const action = game.getGameState();
  const lastUpdate = game.lastUpdate;

  const passivePlayers = opponents.filter((player) =>
    !game.isTurnOf(player.id)
  );
  sendUpdatesToPlayers(STATES.WAITING, lastUpdate, passivePlayers);

  const activePlayer = opponents.find((player) => game.isTurnOf(player.id));
  sendDataToPlayer(activePlayer, STATES.REINFORCE, lastUpdate);

  return { action, data: { card } };
};
