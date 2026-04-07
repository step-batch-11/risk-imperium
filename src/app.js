import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { handleUserActions } from "./handlers/user_actions.js";
import { handleGameSetup } from "./handler.js";
import { handleLoadGameState } from "./handlers/handleLoadGameState.js";
import { handleSaveGameState } from "./handlers/handleSaveGameState.js";
import { STATES } from "./config.js";
import { loginHandler } from "./handlers/loginHandler.js";
import { moveToLobby, sendLobbyData } from "./handlers/lobbyHandler.js";
import { setGame } from "./middleWare.js";

export const createApp = (
  gamesRepo,
  isDevMode,
  players,
  lobby,
  { logger, readTextFile, writeTextFile } = {},
) => {
  const app = new Hono();

  if (logger) {
    app.use(logger());
  }

  app.use(async (context, next) => {
    context.set("gamesRepo", gamesRepo);
    context.set("players", players);
    context.set("lobbies", lobby);
    await next();
  });

  app.get("/setup", setGame, handleGameSetup);

  app.post("/user-actions", setGame, handleUserActions);

  app.get("/get-data", async (c) => {
    await delay(2000);
    game.updateSTATE(STATES.REINFORCE);
    return c.json({ action: STATES.REINFORCE, data: {} });
  });

  app.post("/login", loginHandler);
  app.post("/start-game", moveToLobby);
  app.get("/get-lobby-data", sendLobbyData);
  if (isDevMode) {
    app.get(
      "/load/:state",
      setGame,
      (c) => handleLoadGameState(c, readTextFile),
    );

    app.get(
      "/save/:name",
      setGame,
      (c) => handleSaveGameState(c, writeTextFile, game),
    );
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
