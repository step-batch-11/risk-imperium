import { getCookie } from "hono/cookie";
export const setGame = (context, next, getCookieFn = getCookie) => {
  const gamesRepo = context.get("gamesRepo");
  const gid = Number(getCookieFn(context, "gameId"));
  const game = gamesRepo.get(gid);
  const playerId = Number(getCookieFn(context, "playerId"));
  context.set("game", game);
  context.set("playerId", playerId);

  return next();
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
  return next();
};
export const rejectUnknownUser = (context, next, getCookieFn = getCookie) => {
  const playerId = getCookieFn(context, "playerId");
  const players = context.get("players");
  console.log(playerId, players);

  if (!players[playerId]) {
    return context.redirect("/login.html");
  }

  return next();
};

export const redirectInGamePlayer = (
  context,
  next,
  getCookieFn = getCookie,
) => {
  const gameId = Number(getCookieFn(context, "gameId"));
  const gamesRepo = context.get("gamesRepo");
  if (gamesRepo.has(gameId)) {
    return context.redirect("/game.html");
  }
  return next();
};

export const rejectIfNotInGame = (context, next, getCookieFn = getCookie) => {
  const gameId = Number(getCookieFn(context, "gameId"));
  const gamesRepo = context.get("gamesRepo");
  if (!gamesRepo.has(gameId)) {
    return context.redirect("/");
  }
  return next();
};
export const redirectInLobbyPlayer = (
  context,
  next,
  getCookieFn = getCookie,
) => {
  const lobbyId = Number(getCookieFn(context, "lobbyId"));
  const lobbies = context.get("lobbies");
  if (lobbies.has(lobbyId)) {
    return context.redirect("/lobby.html");
  }
  return next();
};
