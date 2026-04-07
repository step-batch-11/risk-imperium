import { STATES } from "../config.js";
import { getCardHandler, tradeCardHandler } from "./card_handler.js";
import { fortificationHandler } from "../models/fortification_handler.js";
import { sendDataToPlayer, sendUpdatesToPlayers } from "../utilities.js";

const USER_ACTIONS = {
  REINFORCE: (game, data, currentPlayerId = 0, opponents = []) => {
    const res = game.reinforce(data);
    const lastUpdate = game.lastUpdate;

    if (game.isTurnOf(currentPlayerId)) {
      sendUpdatesToPlayers(STATES.WAITING, lastUpdate, opponents);
      return res;
    }

    const passivePlayers = opponents.filter((player) =>
      game.isTurnOf(player.id)
    );
    sendUpdatesToPlayers(STATES.WAITING, lastUpdate, passivePlayers);

    const newActivePlayer = opponents.find((player) =>
      game.isTurnOf(player.id)
    );
    sendDataToPlayer(newActivePlayer, STATES.INITIAL_REINFORCEMENT, lastUpdate);

    return res;
  },

  SETUP: (game, _data, _currentPlayerId = 0, opponents = []) => {
    const result = game.setupNextPhase();

    const lastUpdate = game.lastUpdate;
    sendUpdatesToPlayers(STATES.WAITING, lastUpdate, opponents);

    return result;
  },

  INVADE: (game, data, _currentPlayerId = 0, opponents = []) => {
    const result = game.invade(data);
    const lastUpdate = game.lastUpdate;

    const defenderId = lastUpdate.data.defenderId;

    const passivePlayers = opponents.filter((player) =>
      player.id !== defenderId
    );
    const defender = opponents.find((player) => player.id === defenderId);

    sendUpdatesToPlayers(STATES.WAITING, lastUpdate, passivePlayers);
    sendDataToPlayer(defender, STATES.DEFEND, lastUpdate);

    return result;
  },
  DEFEND: (game, data, _currentPlayerId = 0, opponents = []) => {
    const result = game.defend(data);
    const lastUpdate = game.lastUpdate;

    const passivePlayers = opponents.filter((player) =>
      game.isTurnOf(player.id)
    );
    sendUpdatesToPlayers(STATES.WAITING, lastUpdate, passivePlayers);

    const activePlayer = opponents.find((player) => game.isTurnOf(player.id));
    sendDataToPlayer(activePlayer, STATES.RESOLVE_COMBAT, lastUpdate);

    return result;
  },
  RESOLVE_COMBAT: (game, data, _currentPlayerId = 0, opponents = []) => {
    const result = game.resolveCombat(data);
    const lastUpdate = game.lastUpdate;

    sendUpdatesToPlayers(STATES.WAITING, lastUpdate, opponents);

    const activePlayer = opponents.find((player) => game.isTurnOf(player.id));
    sendDataToPlayer(activePlayer, STATES.RESOLVE_COMBAT, lastUpdate);

    return result;
  },

  SKIP_FORTIFICATION: (game, _data, _currentPlayerId = 0, opponents = []) => {
    const state = game.getGameState();
    if (state !== STATES.FORTIFICATION) {
      return { action: state, data: [] };
    }

    game.skipFortification();
    const newState = game.getGameState();
    const lastUpdate = game.lastUpdate;

    sendUpdatesToPlayers(STATES.WAITING, lastUpdate, opponents);

    return { action: newState, data: [] };
  },

  GET_CARD: getCardHandler,

  SKIP_INVASION: (game, _data, _currentPlayerId, opponents) => {
    const state = game.getGameState();

    if (state !== STATES.INVASION) {
      return { action: state, data: [] };
    }
    game.skipInvasion();
    const newState = game.getGameState();

    const lastUpdate = game.lastUpdate;

    sendUpdatesToPlayers(STATES.WAITING, lastUpdate, opponents);
    return { action: newState, data: [] };
  },

  FORTIFICATION: fortificationHandler,
  TRADE_CARD: tradeCardHandler,
  CAPTURE: (game, data, _currentPlayerId, opponents) => {
    const result = game.moveIn(data);
    const lastUpdate = game.lastUpdate;

    sendUpdatesToPlayers(STATES.WAITING, lastUpdate, opponents);
    return result;
  },
};

export const handleUserActions = async (context) => {
  try {
    const game = context.get("game");
    const { userActions, data } = await context.req.json();

    const actionToPerform = USER_ACTIONS[userActions];

    const players = game.players;
    const activePlayerId = game.activePlayerId;
    const opponents = players.filter((player) => player.id !== activePlayerId);

    const result = actionToPerform(game, data, activePlayerId, opponents);

    return context.json(result);
  } catch (e) {
    console.log(e);
    return context.json({ msg: e.message }, 500);
  }
};
