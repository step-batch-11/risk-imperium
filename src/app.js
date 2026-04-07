import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { handleUserActions } from "./handlers/user_actions.js";
import { handleGameSetup } from "./handler.js";
import { handleLoadGameState } from "./handlers/handle_load_game_state.js";
import { handleSaveGameState } from "./handlers/handle_save_game_state.js";
import { loginHandler } from "./handlers/login_handler.js";
import { moveToLobby, sendLobbyData } from "./handlers/lobby_handler.js";
import { setGame } from "./middle_ware.js";

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
