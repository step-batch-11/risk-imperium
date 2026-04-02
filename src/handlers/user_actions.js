import { STATES } from "../config.js";

const USER_ACTIONS = {
  REINFORCE: (game, data) => game.reinforce(data),
  SETUP: (game) => game.setupNextPhase(),
  INVADE: (game, data) => game.invade(data),
  DEFEND: (game, data) => game.defend(data),
  RESOLVE_COMBAT: (game, data) => game.resolveCombat(data),
  SKIP_FORTIFICATION: (game) => {
    const state = game.getGameState();

    if (state !== STATES.FORTIFICATION) {
      return { action: state, data: [] };
    }

    game.skipFortification();

    const newState = game.getGameState();

    return { action: newState, data: [] };
  },
};

export const handleUserActions = async (context) => {
  try {
    const game = context.get("game");
    const { userActions, data } = await context.req.json();
    const actionToPerform = USER_ACTIONS[userActions];

    const result = actionToPerform(game, data);

    return context.json(result);
  } catch (e) {
    return context.json({ msg: e.message }, 500);
  }
};
