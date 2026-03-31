import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { handleUserActions } from "./handlers/user_actions.js";

import { handleGameSetup, handleGetGameState } from "./handler.js";

export const createApp = (game, isDevMode, { logger, readTextFile } = {}) => {
  const app = new Hono();

  if (logger) {
    app.use(logger());
  }

  app.use(async (context, next) => {
    context.set("game", game);
    await next();
  });

  app.get("/setup", handleGameSetup);
  app.get("/get-game-state", handleGetGameState);

  app.post("/user-actions", handleUserActions);

  if (isDevMode) {
    app.get("/:state", async (c) => {
      const { state } = c.req.param();
      return await readTextFile(`./data/states/${state}.json`).then((data) => {
        const savedState = JSON.parse(data);
        game.loadGameState(savedState);
        return c.redirect("/");
      }).catch(() => {
        return c.body("Bad Request", 404);
      });
    });
  }
  app.get("*", serveStatic({ root: "./public" }));
  return app;
};
