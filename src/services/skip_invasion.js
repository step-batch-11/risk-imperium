import { STATES } from "../config.js";
import { ERROR_MESSAGE } from "../config/error_message.js";

export const skipInvasionService = (game) => {
  const state = game.getGameState();

  if (state !== STATES.INVASION) {
    throw new Error(ERROR_MESSAGE.INVALID_ACTION);
  }

  game.setNewState(STATES.FORTIFICATION);
  game.updateGame(STATES.SKIP_INVASION, {}, game.activePlayerId);
  const newState = game.getGameState();

  return { action: newState, data: [] };
};
