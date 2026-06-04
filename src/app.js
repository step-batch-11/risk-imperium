import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { gameController } from "./handlers/user_actions.js";
import { handleWaiting } from "./handlers/passivePlayers.js";
import { handleGameSetup } from "./handler.js";
import { handleLoadGameState } from "./handlers/handle_load_game_state.js";
import { handleSaveGameState } from "./handlers/handle_save_game_state.js";
import { loginHandler, logoutHandler } from "./handlers/auth.js";
import {
  createRoom,
  joinRoom,
  leaveLobbyHandler,
  moveToLobby,
  sendLobbyData,
  startGame,
} from "./handlers/lobby/lobby_handler.js";

import {
  redirectInGamePlayer,
  redirectInLobbyPlayer,
  redirectLoggedInPlayer,
  rejectIfNotInGame,
  rejectUnknownUser,
  setGame,
} from "./middle_ware.js";
import { setCookie } from "hono/cookie";

export const createApp = (
  gamesRepo,
  isDevMode,
  players,
  lobbies,
  { counter, logger, readTextFile, writeTextFile } = {},
) => {
  const app = new Hono();

  if (logger) {
    app.use(logger());
  }

  app.use(async (context, next) => {
    context.set("gamesRepo", gamesRepo);
    context.set("players", players);
    context.set("lobbies", lobbies);
    context.set("counter", counter);
    await next();
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
    gameController,
  );

  app.post("/login", redirectLoggedInPlayer, loginHandler);
  app.post("/logout", rejectUnknownUser, logoutHandler);

  app.post(
    "/quick-play",
    rejectUnknownUser,
    redirectInLobbyPlayer,
    moveToLobby,
  );
  app.post("/create-room", createRoom);
  app.post("/join-room", joinRoom);
  app.get("/start-game", startGame);

  app.get("/get-data", setGame, handleWaiting);

  app.get("/get-lobby-data", rejectUnknownUser, sendLobbyData);

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

  app.post(
    "/leave-lobby",
    rejectUnknownUser,
    redirectInGamePlayer,
    leaveLobbyHandler,
  );

  if (isDevMode) {
    let id = 1;

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

    app.get("/dev", (c) => {
      return c.redirect("/dev.html");
    });

    app.post("/dev/login", async (c) => {
      const { name } = await c.req.json();
      const players = c.get("players");
      const playerId = id++;
      players[playerId] = name;

      setCookie(c, "playerId", playerId);
      return c.json("Done");
    });
  }

  app.use("/assets/*", serveStatic({ root: "./public" }));
  app.get("*", serveStatic({ root: "./public" }));
  return app;
};
