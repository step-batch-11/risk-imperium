import { logger } from "hono/logger";
import { createApp } from "./src/app.js";
import { Game } from "./src/game.js";

const main = () => {
  const game = new Game(Math.random);
  game.initTerritories();
  const isDevMode = Deno.env.get("DEV_MODE") === "true";
  const app = createApp(game, isDevMode, {
    logger,
    readTextFile: Deno.readTextFile,
    writeTextFile: Deno.writeTextFileSync,
  });
  const port = Deno.env.get("PORT") || 8000;
  Deno.serve({ port }, app.fetch);
};

main();
