import { deleteCookie, setCookie } from "hono/cookie";
let id = 1;

export const loginHandler = async (context) => {
  const players = context.get("players");
  const username = await context.req.parseBody().then((x) => x.username);
  players[id] = username;
  setCookie(context, "playerId", id);
  id++;
  return context.redirect("/");
};

export const logoutHandler = (context) => {
  deleteCookie(context, "playerId");
  deleteCookie(context, "lobbyId");
  deleteCookie(context, "gameId");
  deleteCookie(context, "game-v ersion");
  return context.redirect("/login.html");
};
