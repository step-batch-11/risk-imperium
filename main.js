import { logger } from "hono/logger";
import { createApp } from "./src/app.js";
import { Game } from "./src/game.js";
import { Cards } from "./src/models/cards.js";
import { ContinentsHandler } from "./src/models/continents_handler.js";
import { mockPlayers } from "./src/mock_data.js";
import { CONFIG } from "./src/config.js";
import { FortificationHandler } from "./src/models/fortification_handler.js";

const main = () => {
  const handlers = {
    fortificationHandler: new FortificationHandler(CONFIG.TERRITORIES),
    continentsHandler: new ContinentsHandler(),
    cardsHandler: new Cards(),
  };

  const utilities = {
    random: Math.random,
  };

  const game = new Game(mockPlayers(), CONFIG.TERRITORIES, handlers, utilities);
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
