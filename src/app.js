import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { handleUserActions } from "./handlers/user_actions.js";
import { handleGameSetup } from "./handler.js";

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

    app.get("/save/:name", (c) => {
      const { name } = c.req.param();
      const gameState = game.getSavableGameState();
      const savingData = JSON.stringify(gameState);
      writeTextFile(`./data/states/${name}.json`, savingData);
      return c.redirect("/");
    });
  }
  app.get("*", serveStatic({ root: "./public" }));
  return app;
};
