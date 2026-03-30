import { createApp } from "./src/app.js";
import { Game } from "./src/game.js";

const main = () => {
  const game = new Game();
  const app = createApp(game);

  const port = Deno.env.get("PORT") || 8000;
  Deno.serve({ port }, app.fetch);
};

main();
