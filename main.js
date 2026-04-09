import { logger } from "hono/logger";
import { createApp } from "./src/app.js";

const main = () => {
  const players = {};
  const lobbies = new Map();
  const gamesRepo = new Map();
  const counter = { value: 100 };

  const isDevMode = Deno.env.get("DEV_MODE") === "true";

  const app = createApp(gamesRepo, isDevMode, players, lobbies, {
    counter,
    logger,
    readTextFile: Deno.readTextFile,
    writeTextFile: Deno.writeTextFileSync,
  });
  const port = Deno.env.get("PORT") || 8000;
  Deno.serve({ port }, app.fetch);
};

main();
