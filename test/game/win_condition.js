import { beforeEach, describe } from "@std/testing/bdd";
import { FortificationController } from "../../src/handlers/fortification_controller.js";
import { Continents } from "../../src/models/continents.js";
import { Territories } from "../../src/models/territory.js";
import { InitialReinforcementController } from "../../src/handlers/initial_reinforcement_controller.js";
import { ReinforcementController } from "../../src/handlers/reinforcement_controller.js";
import { InvasionController } from "../../src/handlers/invasion_controller.js";
import { mockPlayers } from "../../src/mock_data.js";
import { CONFIG } from "../../src/config.js";
import { Cards } from "../../src/models/cards.js";
import { Cavalry } from "../../src/models/cavalry.js";
import { Game } from "../../src/game.js";

describe("WIN CONDITION", () => {
  beforeEach(() => {
    const handlers = {
      fortificationHandler: new FortificationController(CONFIG.TERRITORIES),
      continentsHandler: new Continents(),
      cardsHandler: new Cards(),
      cavalry: new Cavalry(),
      territoriesHandler: new Territories(CONFIG.TERRITORIES),
    };

    const utilities = { random: () => 1 };

    const controllers = {
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

    game = new Game(mockPlayers(), handlers, controllers, utilities);
  });
});
