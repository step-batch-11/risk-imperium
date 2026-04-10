import { InvasionController } from "../src/handlers/invasion_controller.js";
import { Cards } from "../src/models/cards.js";
import { Cavalry } from "../src/models/cavalry.js";
import { Continents } from "../src/models/continents.js";
import { Territories } from "../src/models/territory.js";

export const loadGameStateForTest = (game, savedState) => {
  const territoires = structuredClone(savedState.territories);
  const handlers = {
    cavalry: new Cavalry(savedState.cavalry),
    territoriesHandler: new Territories(territoires),

    continentsHandler: new Continents(),
    cardsHandler: new Cards(),
  };

  const controllers = {
    invasionController: new InvasionController(handlers.territoriesHandler),
  };

  game.loadGameState(savedState, handlers, controllers);
};
