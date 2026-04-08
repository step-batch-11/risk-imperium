import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { handleUserActions, handleWaiting } from "./handlers/user_actions.js";
import { handleGameSetup } from "./handler.js";
import { handleLoadGameState } from "./handlers/handle_load_game_state.js";
import { handleSaveGameState } from "./handlers/handle_save_game_state.js";
import { loginHandler } from "./handlers/login_handler.js";
import { moveToLobby, sendLobbyData } from "./handlers/lobby_handler.js";
import {
  redirectInGamePlayer,
  redirectInLobbyPlayer,
  redirectLoggedInPlayer,
  rejectIfNotInGame,
  rejectUnknownUser,
  setGame,
} from "./middle_ware.js";

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
    return await next();
  });

  app.get(
    "/setup",
    rejectUnknownUser,
    rejectIfNotInGame,
    setGame,
    handleGameSetup,
  );

  app.post(
    "/user-actions",
    rejectUnknownUser,
    rejectIfNotInGame,
    setGame,
    handleUserActions,
  );

  app.post("/login", redirectLoggedInPlayer, loginHandler);

  app.post(
    "/quick-play",
    rejectUnknownUser,
    redirectInLobbyPlayer,
    moveToLobby,
  );

  app.get("/get-data", setGame, handleWaiting);

  app.get("/get-lobby-data", sendLobbyData);

  app.get(
    "/login.html",
    redirectLoggedInPlayer,
    serveStatic({ root: "./public" }),
  );

  app.get(
    "/",
    rejectUnknownUser,
    redirectInLobbyPlayer,
    redirectInGamePlayer,
    serveStatic({ root: "./public" }),
  );

  app.get(
    "/game.html",
    rejectUnknownUser,
    rejectIfNotInGame,
    serveStatic({ root: "./public" }),
  );

  app.get(
    "/lobby.html",
    rejectUnknownUser,
    redirectInGamePlayer,
    serveStatic({ root: "./public" }),
  );

  if (isDevMode) {
    app.get(
      "/load/:state",
      setGame,
      (c) => handleLoadGameState(c, readTextFile),
    );

    app.get(
      "/save/:name",
      setGame,
      (c) => handleSaveGameState(c, writeTextFile),
    );
  }
  app.get("*", serveStatic({ root: "./public" }));
  return app;
};
