import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { handleUserActions } from "./handlers/user_actions.js";
import { handleGameSetup } from "./handler.js";
import { handleLoadGameState } from "./handlers/handleLoadGameState.js";
import { handleSaveGameState } from "./handlers/handleSaveGameState.js";
import { STATES } from "./config.js";

export const createApp = (
  game,
  isDevMode,
  { logger, readTextFile, writeTextFile } = {},
) => {
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

  app.get("/get-data", async (c) => {
    await delay(2000);
    game.updateSTATE(STATES.REINFORCE);
    return c.json({ action: STATES.REINFORCE, data: {} });
  });
  if (isDevMode) {
    app.get("/load/:state", (c) => handleLoadGameState(c, readTextFile, game));

    app.get("/save/:name", (c) => handleSaveGameState(c, writeTextFile, game));
  }
  app.get("*", serveStatic({ root: "./public" }));
  return app;
};

const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, time);
  });
};
