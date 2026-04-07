import { STATES } from "../config.js";
import { getCardHandler, tradeCardHandler } from "./card_handler.js";
import { fortificationHandler } from "../models/fortification_handler.js";
import { sendDataToPlayer, sendUpdatesToPlayers } from "../utilities.js";
import { getCookie, setCookie } from "hono/cookie";

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

  RESOLVE_COMBAT: (game, _data, currentPlayerId = 0, opponents = []) => {
    const { action, data } = game.resolveCombat();
    const lastUpdate = game.lastUpdate;

    sendUpdatesToPlayers(STATES.WAITING, lastUpdate, opponents);

    const activePlayer = opponents.find((player) => game.isTurnOf(player.id));
    sendDataToPlayer(activePlayer, STATES.RESOLVE_COMBAT, lastUpdate);
    if (
      game.isTurnOf(currentPlayerId) && game.getGameState() === STATES.MOVE_IN
    ) {
      return { action: STATES.MOVE_IN, data };
    }
    return { action, data };
  },

  GET_MOVE_IN_DATA: (game, _data, _currentPlayer = 0, _opponents = []) => {
    return { data: game.lastUpdate };
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
    const gameVersion = game.version;
    setCookie(context, "game-version", gameVersion);

    return context.json(result);
  } catch (e) {
    console.log(e);
    return context.json({ msg: e.message }, 500);
  }
};

const handleDifferentGameVersionId = (game, playerId, gameVersionId) => {
  const data = game.getUpdates(gameVersionId, playerId);
  const isActive = game.isTurnOf(playerId);
  const isReinforce = game.getGameState() === STATES.REINFORCE;
  const isDefending = game.isPlayerDefending(playerId);

  if (isActive && isReinforce) {
    return { action: STATES.REINFORCE, data };
  }

  if (isActive) {
    return { action: STATES.RESOLVE_COMBAT, data };
  }

  if (isDefending) {
    const invadeDetails = game.invadeDetail;
    return { action: STATES.DEFEND, data: { ...data, invadeDetails } };
  }

  return { action: STATES.WAITING, data };
};

export const handleWaiting = async (c) => {
  const gameVersionId = Number(getCookie(c, "game-version"));
  const game = c.get("game");
  const playerId = Number(getCookie(c, "playerId"));
  if (!game.isLatestId(gameVersionId)) {
    const result = handleDifferentGameVersionId(game, playerId, gameVersionId);
    const gameVersion = game.version;
    setCookie(c, "game-version", gameVersion);
    return c.json(result);
  }

  await delay(1000);

  return c.text(null, 204);
};

const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, time);
  });
};
