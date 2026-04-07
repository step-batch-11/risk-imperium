import { FortificationController } from "../src/handlers/fortification_controller.js";
import { InitialReinforcementController } from "../src/handlers/initial_reinforcement_controller.js";
import { InvasionController } from "../src/handlers/invasion_controller.js";
import { ReinforcementController } from "../src/handlers/reinforcement_controller.js";
import { Cards } from "../src/models/cards.js";
import { Cavalry } from "../src/models/cavalry.js";
import { ContinentsHandler } from "../src/models/continents_handler.js";
import { TerritoriesHandler } from "../src/models/territoryHandler.js";

export const loadGameStateForTest = (game, savedState) => {
  const handlers = {
    cavalry: new Cavalry(savedState.cavalry),
    territoriesHandler: new TerritoriesHandler(savedState.territories),
    fortificationHandler: new FortificationController(savedState.territories),
    continentsHandler: new ContinentsHandler(),
    cardsHandler: new Cards(),
  };

  const controllers = {
    initialReinforcementController: new InitialReinforcementController(
      1,
      handlers.territoriesHandler,
    ),
    reinforcementController: new ReinforcementController(
      handlers.territoriesHandler,
      handlers.continentsHandler,
    ),
    invasionController: new InvasionController(handlers.territoriesHandler),
  };

  game.loadGameState(savedState, handlers, controllers);
};
