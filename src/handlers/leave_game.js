import { deleteCookie, getCookie } from "hono/cookie";
import { broadCastNewUpdates } from "./passivePlayers.js";

export const leaveGameHandler = (
  context,
  _next,
  getCookieFn = getCookie,
  deleteCookieFn = deleteCookie,
) => {
  const game = context.get("game");
  const playerId = Number(getCookieFn(context, "playerId"));

  const stillInGame = game.players.some((p) => p.id === playerId);
  if (!stillInGame) {
    return context.json({ success: false });
  }

  game.removePlayer(playerId);
  broadCastNewUpdates(game.players);

  deleteCookieFn(context, "gameId");
  deleteCookieFn(context, "game-version");

  return context.json({ success: true });
};
