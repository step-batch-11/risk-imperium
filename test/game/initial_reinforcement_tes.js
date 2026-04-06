import { beforeEach, describe, it } from "@std/testing/bdd";
import { FortificationController } from "../../src/handlers/fortification_controller.js";
import { ContinentsHandler } from "../../src/models/continents_handler.js";
import { Cards } from "../../src/models/cards.js";
import { Cavalry } from "../../src/models/cavalry.js";
import { TerritoriesHandler } from "../../src/models/territoryHandler.js";
import { InitialReinforcementController } from "../../src/handlers/initialreinforcement_controller.js";
import { ReinforcementController } from "../../src/handlers/reinforcement_controller.js";
import { InvasionController } from "../../src/handlers/invasion_controller.js";
import { mockPlayers } from "../../src/mock_data.js";
import { Game } from "../../src/game.js";
import { CONFIG, STATES } from "../../src/config.js";
import { assertEquals } from "@std/assert/equals";

import initialReinforcementState from "../../data/states/init-reinforcement.json" with {
  type: "json",
};
import initialReinforcementLastTroopState from "../../data/states/init-reinforcement-last-troop.json" with {
  type: "json",
};
import { loadGameStateForTest } from "../utilities.js";

let game;
describe("INITIAL REINFORCEMENT", () => {
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
  game = new Game(mockPlayers(), handlers, controllers, utilities);

  beforeEach(() => {
    const savedState = initialReinforcementState;

    const handlers = {
      cavalry: new Cavalry(savedState.cavalry),
      territoriesHandler: new TerritoriesHandler(savedState.territories),
      fortificationHandler: new FortificationController(savedState.territories),
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
  });

  it("Should set the initial remaining troops to deploy", () => {
    game.initTerritories();

    const { action, data } = game.setupNextPhase();

    assertEquals(action, STATES.INITIAL_REINFORCEMENT);
    assertEquals(data.troopsToReinforce, 13);
  });

  it("reinforce method should return the updated troop count with the territory id", () => {
    const expectedTroopCount =
      initialReinforcementState.territories[37].troopCount + 1;
    const { action, data } = game.reinforce({
      territoryId: 37,
      troopCount: 1,
    });

    assertEquals(action, STATES.INITIAL_REINFORCEMENT);
    assertEquals(data.updatedTerritory.length, 1);
    const updatedTerritory = data.updatedTerritory[0];
    assertEquals(updatedTerritory.territoryId, 37);
    assertEquals(updatedTerritory.troopCount, expectedTroopCount);
  });

  it("reinforce method should change the game state when all troops are deployed", () => {
    const savedState = initialReinforcementLastTroopState;
    loadGameStateForTest(game, savedState);

    Array.from(
      { length: 12 },
      () => game.reinforce({ territoryId: 28, troopCount: 1 }),
    );

    const { action } = game.reinforce({ territoryId: 28, troopCount: 1 });

    assertEquals(action, STATES.REINFORCE);
  });
});
