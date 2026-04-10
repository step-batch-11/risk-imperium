import { STATES } from "../config.js";
import { ERROR_MESSAGE } from "../config/error_message.js";

export const skipFortificationService = (game) => {
  const state = game.getGameState();
  if (state !== STATES.FORTIFICATION) {
    throw ERROR_MESSAGE.INVALID_ACTION;
  }

  game.setNewState(STATES.GET_CARD);
  game.updateGame(STATES.SKIP_FORTIFICATION, {}, game.activePlayerId);

  const newState = game.getGameState();

  return { action: newState, data: {} };
};
