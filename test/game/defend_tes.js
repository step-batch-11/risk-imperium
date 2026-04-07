import { beforeEach, describe, it } from "@std/testing/bdd";
import { FortificationController } from "../../src/handlers/fortification_controller.js";
import { ContinentsHandler } from "../../src/models/continents_handler.js";
import { Cards } from "../../src/models/cards.js";
import { Cavalry } from "../../src/models/cavalry.js";
import { TerritoriesHandler } from "../../src/models/territoryHandler.js";
import { InitialReinforcementController } from "../../src/handlers/initialReinforcement_controller.js";
import { ReinforcementController } from "../../src/handlers/reinforcement_controller.js";
import { InvasionController } from "../../src/handlers/invasion_controller.js";
import { mockPlayers } from "../../src/mock_data.js";
import { Game } from "../../src/game.js";
import { CONFIG } from "../../src/config.js";
import { assertEquals } from "@std/assert/equals";

describe("Game Defend", () => {
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

  describe("DEFEND", () => {
    it("should return next state and data", () => {
      const handlers = {
        fortificationHandler: new FortificationController(CONFIG.TERRITORIES),
        continentsHandler: new ContinentsHandler(),
        cardsHandler: new Cards(),
        cavalry: new Cavalry(),
        territoriesHandler: new TerritoriesHandler(CONFIG.TERRITORIES),
      };

      const utilities = { random: Math.random };

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

      const game = new Game(mockPlayers(), handlers, controllers, utilities);

      const savedState = defendState;
      const handler = {
        fortificationHandler: new FortificationController(
          defendState.territories,
        ),
      };
      game.loadGameState(savedState, handler);

      const defendData = { territoryId: "22", troopCount: 1 };
      const { action, data } = game.defend(defendData);
      const { stateDetails } = game.getSavableGameState();

      assertEquals(action, STATES.RESOLVE_COMBAT);
      assertEquals(data.attackerTroops, stateDetails.attackerTroops);
      assertEquals(data.defenderTroops, stateDetails.defenderTroops);
      assertEquals(data.defenderTerritoryId, stateDetails.defenderTerritoryId);
      assertEquals(data.attackerTerritoryId, stateDetails.attackerTerritoryId);
    });
  });
});
