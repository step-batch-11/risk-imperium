import { STATES, TIMEOUT } from "../config.js";
import { getCardService, tradeCardService } from "../services/card_service.js";

import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { reinforcementsServices } from "../services/reinforcement.js";

import { setupService } from "../services/setup_service.js";
import { getMoveInDataService } from "../services/get_move_in_data.js";
import { fortificationService } from "../services/fortification.js";
import { skipFortificationService } from "../services/skip_fortification.js";
import { skipInvasionService } from "../services/skip_invasion.js";
import { captureService } from "../services/capture.js";
import { invadeService } from "../services/invade.js";
import { defendService } from "../services/defend.js";
import { resolveCombatService } from "../services/resolve_combat.js";

const USER_ACTIONS = {
  REINFORCE: reinforcementsServices,
  SETUP: setupService,
  GET_MOVE_IN_DATA: getMoveInDataService,
  GET_CARD: getCardService,
  TRADE_CARD: tradeCardService,
  FORTIFICATION: fortificationService,
  SKIP_FORTIFICATION: skipFortificationService,
  SKIP_INVASION: skipInvasionService,
  INVADE: invadeService,
  DEFEND: defendService,
  RESOLVE_COMBAT: resolveCombatService,
  CAPTURE: captureService,
};

const broadCastNewUpdates = (players) => {
  players.forEach((player) => {
    const resolver = player.resolve;
    if (resolver) {
      resolver();
    }
    player.resolve = null;
  });
};

export const handleUserActions = async (
  context,
  _next,
  setCookieFn = setCookie,
) => {
  try {
    const game = context.get("game");
    const { userActions, data } = await context.req.json();

    const actionToPerform = USER_ACTIONS[userActions];

    const players = game.players;

    const activePlayerId = game.activePlayerId;
    const opponents = players.filter((player) => player.id !== activePlayerId);

    const result = actionToPerform(game, data, activePlayerId, opponents);
    if (result.action === STATES.WON) {
      deleteCookie(context, "gameId");
      deleteCookie(context, "lobbyId");
    }
    const gameVersion = game.version;
    setCookieFn(context, "game-version", gameVersion);
    broadCastNewUpdates(players);

    return context.json(result);
  } catch (e) {
    console.log(e);
    return context.json({ msg: e.message }, 500);
  }
};

const gameService = (userActions, game, data) => {
  const actionToPerform = USER_ACTIONS[userActions];

  const players = game.players;

  const activePlayerId = game.activePlayerId;
  const opponents = players.filter((player) => player.id !== activePlayerId);

  const result = actionToPerform(game, data, activePlayerId, opponents);

  broadCastNewUpdates(players);
  return result;
};

export const gameController = async (
  context,
  _next,
  setCookieFn = setCookie,
) => {
  try {
    const game = context.get("game");
    const { userActions, data } = await context.req.json();

    const result = gameService(userActions, game, data);

    if (result.action === STATES.WON) {
      deleteCookie(context, "gameId");
      deleteCookie(context, "lobbyId");
    }
    const gameVersion = game.version;
    setCookieFn(context, "game-version", gameVersion);

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
  const isInitialReinforcement =
    game.getGameState() === STATES.INITIAL_REINFORCEMENT;
  const isDefending = game.isPlayerDefending(playerId);

  if (isActive && isReinforce) {
    return { action: STATES.REINFORCE, data, lastAction: game.lastUpdate };
  }

  if (isActive && isInitialReinforcement) {
    return {
      action: STATES.INITIAL_REINFORCEMENT,
      data,
      lastAction: game.lastUpdate,
    };
  }

  if (isActive) {
    return { action: STATES.RESOLVE_COMBAT, data, lastAction: game.lastUpdate };
  }

  if (isDefending) {
    const invadeDetails = game.invadeDetail;
    return {
      action: STATES.DEFEND,
      data: { ...data, invadeDetails },
      lastAction: game.lastUpdate,
    };
  }

  return { action: STATES.WAITING, data, lastAction: game.lastUpdate };
};

const serveUpdatesToPlayer = (c, game, playerId, gameVersionId) => {
  const gameVersion = game.version;
  const result = handleDifferentGameVersionId(game, playerId, gameVersionId);
  setCookie(c, "game-version", gameVersion);
  return result;
};

export const handleWaiting = async (c) => {
  const gameVersionId = Number(getCookie(c, "game-version"));
  const game = c.get("game");
  const playerId = Number(getCookie(c, "playerId"));
  const player = game.players.find((player) => player.id === playerId);

  if (!player) {
    deleteCookie(c, "gameId");
    deleteCookie(c, "lobbyId");
    deleteCookie(c, "gameId");
    return c.json({
      action: STATES.ELIMINATED,
      data: game.getUpdates(gameVersionId),
      lastAction: game.lastUpdate,
    });
  }

  if (!game.isLatestId(gameVersionId)) {
    const result = serveUpdatesToPlayer(c, game, playerId, gameVersionId);
    return c.json(result);
  }

  const response = await new Promise((resolve, reject) => {
    player.resolve = resolve;
    setTimeout(() => {
      reject(1);
    }, TIMEOUT);
  })
    .then(() => {
      if (gameVersionId === game.version) {
        return c.text(null, 204);
      }
      const result = serveUpdatesToPlayer(c, game, playerId, gameVersionId);
      return c.json(result);
    })
    .catch(() => {
      return c.text(null, 204);
    });

  return response;
};
