import { deleteCookie, getCookie } from "hono/cookie";
import { broadCastNewUpdates } from "./passivePlayers.js";

export const leaveGameHandler = (context) => {
  const game = context.get("game");
  const playerId = Number(getCookie(context, "playerId"));

  game.leaveGame(playerId);
  broadCastNewUpdates(game.players);

  deleteCookie(context, "gameId");

  return context.json({ action: "LEFT" });
};
