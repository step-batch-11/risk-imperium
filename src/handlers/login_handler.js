import { deleteCookie, setCookie } from "hono/cookie";

export const loginHandler = async (context) => {
  const players = context.get("players");
  const username = await context.req.parseBody().then((x) => x.username);
  const id = Date.now();
  players[id] = username;
  setCookie(context, "playerId", id);
  return context.redirect("/");
};

export const logoutHandler = (context) => {
  deleteCookie(context, "playerId");
  deleteCookie(context, "lobbyId");
  deleteCookie(context, "gameId");
  deleteCookie(context, "game-version");
  return context.redirect("/login.html");
};
