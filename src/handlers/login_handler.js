import { setCookie } from "hono/cookie";
let id = 1;

export const loginHandler = async (context) => {
  const players = context.get("players");
  const username = await context.req.parseBody().then((x) => x.username);
  players[id] = username;
  id++;
  setCookie(context, "playerId", id);
  return context.redirect("/");
};
