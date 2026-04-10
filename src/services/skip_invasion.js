import { STATES } from "../config.js";

export const skipInvasionService = (game) => {
  const state = game.getGameState();

  if (state !== STATES.INVASION) {
    return { action: state, data: [] };
  }

  game.setNewState(STATES.FORTIFICATION);
  game.updateGame(STATES.SKIP_INVASION, {}, game.activePlayerId);
  const newState = game.getGameState();

  return { action: newState, data: [] };
};
