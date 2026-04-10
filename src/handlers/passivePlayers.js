import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { STATES, TIMEOUT } from "../config.js";

export const broadCastNewUpdates = (players) => {
  players.forEach((player) => {
    const resolver = player.resolve;
    if (resolver) {
      resolver();
    }
    player.resolve = null;
  });
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
