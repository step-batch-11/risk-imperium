import { beforeEach, describe, it } from "@std/testing/bdd";
import { Game } from "../src/game.js";
import { assert, assertEquals, assertFalse } from "@std/assert";
import { CONFIG, STATES } from "../src/config.js";

import { ContinentsHandler } from "../src/models/continents_handler.js";
import { FortificationController } from "../src/handlers/fortification_controller.js";

import { Cards } from "../src/models/cards.js";
import { mockPlayers } from "../src/mock_data.js";
import { Cavalry } from "../src/models/cavalry.js";
import { TerritoriesHandler } from "../src/models/territoryHandler.js";
import { InitialReinforcementController } from "../src/handlers/initial_reinforcement_controller.js";
import { ReinforcementController } from "../src/handlers/reinforcement_controller.js";
import { InvasionController } from "../src/handlers/invasion_controller.js";

import aboutToWon from "../data/tests/about-to-win.json" with { type: "json" };
import { loadGameStateForTest } from "./utilities.js";

describe("Game", () => {
  let game;

  beforeEach(() => {
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

    game = new Game(mockPlayers(), handlers, controllers, utilities);
  });

  it("setup method should return data for the single user", () => {
    const setupData = game.getSetup(1);
    const setupDataProperties = Object.keys(setupData);
    const expectedKeys = [
      "continents",
      "territories",
      "player",
      "opponents",
      "currentPlayer",
      "cavalryPositions",
      "state",
    ];

    assertEquals(expectedKeys.length, setupDataProperties.length);
    expectedKeys.forEach((expectedKey) => {
      assert(setupDataProperties.some((key) => key === expectedKey));
    });
  });

  describe("isCurrentUserTerritory", () => {
    beforeEach(() => {
      loadGameStateForTest(game, aboutToWon);
    });
    it("should give true if current player own territory of given territory id ", () => {
      assert(game.isCurrentUserTerritory(16));
    });

    it("should give false if current player doesn't own territory of given territory id ", () => {
      assertFalse(game.isCurrentUserTerritory(27));
    });
  });

  describe("getGameState", () => {
    it("Should return the current state of the game", () => {
      const state = game.getGameState();
      assertEquals(state, STATES.SETUP);
    });
  });

  describe("GETS AVAILABLE GAME STATE", () => {
    it("Should return new game state when game is just initialize", () => {
      const gameState = game.getSavableGameState();

      const expectedParameters = [
        "activePlayerId",
        "territories",
        "players",
        "continents",
        "state",
        "initReinforce",
        "reinforce",
        "invasion",
        "cavalry",
        "hasCaptured",
      ];

      const parameters = Object.keys(gameState);
      assertEquals(expectedParameters.length, parameters.length);
      assert(parameters.every((param) => expectedParameters.includes(param)));
      assertEquals(gameState.state, STATES.SETUP);
    });

    it("Should return updated game state when game is initialize and troop initialization action is already done", () => {
      game.initTerritories();
      const gameState = game.getSavableGameState();
      const expectedParameters = [
        "activePlayerId",
        "territories",
        "players",
        "continents",
        "state",
        "initReinforce",
        "reinforce",
        "invasion",
        "cavalry",
        "hasCaptured",
      ];
      const setupDataProperties = Object.keys(gameState);
      assertEquals(expectedParameters.length, setupDataProperties.length);
      expectedParameters.forEach((expectedKey) => {
        assert(setupDataProperties.some((key) => key === expectedKey));
      });

      const parameters = Object.keys(gameState);
      assertEquals(expectedParameters.length, parameters.length);
      assert(parameters.every((param) => expectedParameters.includes(param)));
      assertEquals(gameState.state, STATES.INITIAL_REINFORCEMENT);
    });
  });

  describe("LOAD GAME STATE", () => {
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

    const game1 = new Game(mockPlayers(), handlers, controllers, utilities);

    game1.initTerritories();

    const initializedGameState = game1.getSavableGameState();

    it("Should reset the gameState when loaded with initialGameState", () => {
      const initialGameState = game.getSavableGameState();

      game.initTerritories();

      loadGameStateForTest(game, initialGameState);
      const loadedGameState = game.getSavableGameState();

      assertEquals(loadedGameState.state, STATES.SETUP);
    });

    it("Should load the initialized game state when loaded with initializedGameState", () => {
      loadGameStateForTest(game, initializedGameState);
      const loadedGameState = game.getSavableGameState();
      assertEquals(loadedGameState.state, STATES.INITIAL_REINFORCEMENT);
    });
  });
});
