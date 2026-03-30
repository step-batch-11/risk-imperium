import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import { handleUserActions } from "./handlers/user_actions.js";
import { handleGameSetup } from "./handler.js";

export const createApp = (game) => {
  const app = new Hono();

  app.use(logger());
  app.use(async (context, next) => {
    context.set("game", game);
    await next();
  });

  app.get("/setup", handleGameSetup);

  app.post("/user-actions", handleUserActions);

  app.get("*", serveStatic({ root: "./public" }));
  return app;
};
