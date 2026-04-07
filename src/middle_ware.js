import { getCookie } from "hono/cookie";
export const setGame = async (context, next) => {
  const gamesRepo = context.get("gamesRepo");
  const gid = getCookie(context, "gameId");
  const game = gamesRepo.get(+gid);
  const playerId = +getCookie(context, "playerId");
  context.set("game", game);
  context.set("playerId", playerId);
  await next();
};
