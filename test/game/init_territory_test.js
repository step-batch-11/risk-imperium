import { beforeEach, describe, it } from "@std/testing/bdd";
import { FortificationController } from "../../src/handlers/fortification_controller.js";
import { ContinentsHandler } from "../../src/models/continents_handler.js";
import { Cards } from "../../src/models/cards.js";
import { Cavalry } from "../../src/models/cavalry.js";
import { TerritoriesHandler } from "../../src/models/territoryHandler.js";
import { InitialReinforcementController } from "../../src/handlers/initial_reinforcement_controller.js";
import { ReinforcementController } from "../../src/handlers/reinforcement_controller.js";
import { InvasionController } from "../../src/handlers/invasion_controller.js";
import { mockPlayers } from "../../src/mock_data.js";
import { Game } from "../../src/game.js";
import { CONFIG } from "../../src/config.js";
import { assertEquals } from "@std/assert/equals";

describe("Game - Initial Reinforcement", () => {
  let game;
  const utilities = { random: Math.random };
  const handlers = {
    fortificationHandler: new FortificationController(CONFIG.TERRITORIES),
    continentsHandler: new ContinentsHandler(),
    cardsHandler: new Cards(),
    cavalry: new Cavalry(),
    territoriesHandler: new TerritoriesHandler(CONFIG.TERRITORIES),
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
    invasionController: new InvasionController(
      handlers.territoriesHandler,
      utilities.random,
    ),
  };
  beforeEach(() => {
    game = new Game(mockPlayers(), handlers, controllers, utilities);
  });

  describe("INIT TERRITORIES", () => {
    it("Init territories method should return the players and territories", () => {
      const { players, territories } = game.initTerritories();
      const setupData = game.getSetup(1);
      assertEquals(territories, setupData.territories);
      assertEquals(
        Object.values(territories).every(({ troopCount }) => troopCount === 1),
        true,
      );

      assertEquals(
        Object.values(players).every(
          ({ id }) => {
            const territories = handlers.territoriesHandler.getTerritoriesOf(
              id,
            );
            return territories.length === 7;
          },
        ),
        true,
      );
    });
  });
});
