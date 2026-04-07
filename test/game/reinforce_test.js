import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import { Game } from "../../src/game.js";
import { mockPlayers } from "../../src/mock_data.js";
import { ContinentsHandler } from "../../src/models/continents_handler.js";
import { TerritoriesHandler } from "../../src/models/territoryHandler.js";
import { InitialReinforcementController } from "../../src/handlers/initialreinforcement_controller.js";
import { ReinforcementController } from "../../src/handlers/reinforcement_controller.js";
import { CONFIG, STATES } from "../../src/config.js";
import { Cards } from "../../src/models/cards.js";
import { Cavalry } from "../../src/models/cavalry.js";

import reinforceState from "../../data/tests/reinforce.json" with {
  type: "json",
};
import { InvasionController } from "../../src/handlers/invasion_controller.js";
import { loadGameStateForTest } from "../utilities.js";

describe.ignore("SET REINFORCEMENTS", () => {
  let game;

  beforeEach(() => {
    const handlers = {
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

    game = new Game(mockPlayers(), handlers, controllers, utilities);
  });

  it("Should set and give the reinforcement ", () => {
    game.initTerritories();
    game.getSetup(1);
    loadGameStateForTest(game, reinforceState);

    const { action, data } = game.setupNextPhase();

    assertEquals(action, STATES.REINFORCE);
    assertEquals(data.troopsToReinforce, 3);
  });
});

describe.ignore("REINFORCE", () => {
  let game;

  beforeEach(() => {
    const handlers = {
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

    game = new Game(mockPlayers(), handlers, controllers, utilities);
    loadGameStateForTest(game, reinforceState);
  });

  it("Should update the troop count and change the state if troops are fully deployed", () => {
    const { action, data } = game.reinforce({
      territoryId: 37,
      troopCount: 3,
    });

    const currentState = game.getSavableGameState();

    assertEquals(action, STATES.INVASION);
    assertEquals(data.updatedTerritory.length, 1);
    const updatedTerritory = data.updatedTerritory[0];
    assertEquals(
      updatedTerritory.troopCount,
      currentState.territories[37].troopCount,
    );
    assertEquals(data.remainingTroops, 0);
  });

  it("Should update the troop only", () => {
    const { action, data } = game.reinforce({
      territoryId: 37,
      troopCount: 1,
    });

    const updatedTerritory = data.updatedTerritory[0];

    assertEquals(action, STATES.REINFORCE);
    assertEquals(data.updatedTerritory.length, 1);
    assertEquals(updatedTerritory.troopCount, 2);
    assertEquals(data.remainingTroops, 2);
  });

  it("Shouldn't change any if the count is not valid", () => {
    const { action, data } = game.reinforce({
      territoryId: 37,
      troopCount: 0,
    });

    const updatedTerritory = data.updatedTerritory[0];

    assertEquals(action, STATES.REINFORCE);
    assertEquals(data.updatedTerritory.length, 1);
    assertEquals(updatedTerritory.troopCount, 1);
    assertEquals(data.remainingTroops, 3);
  });
});
