import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { handleUserActions } from "./handlers/user_actions.js";
import { handleGameSetup } from "./handler.js";
import { SAVED_STATES_GAMES } from "./devModeHandlers.js";

export const createApp = (game, isDevMode, logger) => {
  const app = new Hono();

  if (logger) {
    app.use(logger());
  }

  app.use(async (context, next) => {
    context.set("game", game);
    await next();
  });

  app.get("/setup", handleGameSetup);

  app.post("/user-actions", handleUserActions);

  if (isDevMode) {
    app.get("/:state", (c) => {
      const { state } = c.req.param();
      if (state in SAVED_STATES_GAMES) {
        SAVED_STATES_GAMES[state](game);
        return c.redirect("/");
      }
      return c.body("Bad Request", 404);
    });
  }
  app.get("*", serveStatic({ root: "./public" }));
  return app;
};
