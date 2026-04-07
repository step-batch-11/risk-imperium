import { getCookie } from "hono/cookie";
export const setGame = async (context, next, getCookieFn = getCookie) => {
  const gamesRepo = context.get("gamesRepo");
  const gid = getCookieFn(context, "gameId");
  const game = gamesRepo.get(+gid);
  const playerId = +getCookieFn(context, "playerId");
  context.set("game", game);
  context.set("playerId", playerId);
  await next();
};

export const redirectLoggedInPlayer = (
  context,
  next,
  getCookieFn = getCookie,
) => {
  const playerId = getCookieFn(context, "playerId");
  const players = context.get("players");
  if (players[playerId]) {
    return context.redirect("/");
  }
  next();
};
export const rejectUnknownUser = (context, next, getCookieFn = getCookie) => {
  const playerId = getCookieFn(context, "playerId");
  const players = context.get("players");
  if (!players[playerId]) {
    return context.redirect("/login.html");
  }
  next();
};

export const redirectInGamePlayer = (
  context,
  next,
  getCookieFn = getCookie,
) => {
  const gameId = +getCookieFn(context, "gameId");
  const gamesRepo = context.get("gamesRepo");
  if (gamesRepo.has(gameId)) {
    return context.redirect("/game.html");
  }
  next();
};

export const rejectIfNotInGame = (context, next, getCookieFn = getCookie) => {
  const gameId = +getCookieFn(context, "gameId");
  const gamesRepo = context.get("gamesRepo");
  if (!gamesRepo.has(gameId)) {
    return context.redirect("/");
  }
  next();
};
