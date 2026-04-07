import { CONFIG } from "./config.js";
import { Game } from "./game.js";
import { FortificationController } from "./handlers/fortification_controller.js";
import { InitialReinforcementController } from "./handlers/initial_reinforcement_controller.js";
import { InvasionController } from "./handlers/invasion_controller.js";
import { ReinforcementController } from "./handlers/reinforcement_controller.js";
import { mockPlayers } from "./mock_data.js";
import { Cards } from "./models/cards.js";
import { Cavalry } from "./models/cavalry.js";
import { ContinentsHandler } from "./models/continents_handler.js";
import { TerritoriesHandler } from "./models/territoryHandler.js";

export const createGame = (players = mockPlayers()) => {
  const utilities = { random: Math.random };
  const handlers = {
    continentsHandler: new ContinentsHandler(),
    cardsHandler: new Cards(),
    cavalry: new Cavalry(),
    territoriesHandler: new TerritoriesHandler(CONFIG.TERRITORIES),
  };

  const controllers = {
    fortificationController: new FortificationController(CONFIG.TERRITORIES),
    initialReinforcementController: new InitialReinforcementController(
      1,
      handlers.territoriesHandler,
    ),
    reinforcementController: new ReinforcementController(
      handlers.territoriesHandler,
      handlers.continentsHandler,
    ),
    invasionController: new InvasionController(
      handlers.territoriesHandler,
      utilities.random,
    ),
  };

  const game = new Game(players, handlers, controllers, utilities);
  game.initTerritories();
  return game;
};
