import { deleteCookie, getCookie, setCookie } from "hono/cookie";

export const loginHandler = async (context) => {
  const players = context.get("players");
  const username = await context.req.parseBody().then((x) => x.username);
  const id = Date.now() * Math.random() * Math.random();
  players[id] = username;
  setCookie(context, "playerId", id);
  return context.redirect("/");
};

export const logoutHandler = (
  context,
  _next,
  deleteCookieFn = deleteCookie,
  getCookieFn = getCookie,
) => {
  const players = context.get("players");
  const playerId = getCookieFn(context, "playerId");
  delete players[playerId];
  deleteCookieFn(context, "playerId");
  deleteCookieFn(context, "lobbyId");
  deleteCookieFn(context, "gameId");
  deleteCookieFn(context, "game-version");
  return context.redirect("/login.html");
};
