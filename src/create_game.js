import { CONFIG } from "./config.js";
import { Game } from "./game.js";
import { InvasionController } from "./handlers/invasion_controller.js";
import { mockPlayers } from "./mock_data.js";
import { Cards } from "./models/cards.js";
import { Cavalry } from "./models/cavalry.js";
import { Continents } from "./models/continents.js";
import { Territories } from "./models/territory.js";

export const createGame = (players = mockPlayers()) => {
  const utilities = { random: Math.random };
  const territories = { ...CONFIG.TERRITORIES };
  const handlers = {
    continentsHandler: new Continents(),
    cardsHandler: new Cards(),
    cavalry: new Cavalry(),
    territoriesHandler: new Territories({ ...territories }),
  };

  const controllers = {
    invasionController: new InvasionController(
      handlers.territoriesHandler,
      utilities.random,
    ),
  };

  players.forEach((player, index) => (player.color = index + 1));

  const game = new Game(players, handlers, controllers, utilities, 13);
  game.initTerritories();
  return game;
};
