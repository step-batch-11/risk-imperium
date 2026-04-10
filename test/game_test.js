import { beforeEach, describe, it } from "@std/testing/bdd";
import { assert, assertEquals, assertFalse } from "@std/assert";
import { STATES } from "../src/config.js";
import aboutToWon from "../data/tests/about-to-win.json" with { type: "json" };
import { loadGameStateForTest } from "./utilities.js";
import { createGame } from "../src/create_game.js";

describe("Game", () => {
  let game;

  beforeEach(() => {
    game = createGame();
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
      assertEquals(state, STATES.INITIAL_REINFORCEMENT);
    });
  });

  describe("GETS AVAILABLE GAME STATE", () => {
    it("Should return new game state when game is just initialize", () => {
      const gameState = game.getSavableGameState();

      const expectedParameters = [
        "activePlayerId",
        "activePlayerIndex",
        "territories",
        "players",
        "continents",
        "state",
        "cavalry",
        "hasCaptured",
        "round",
        "troops",
        "playersCount",
        "stateDetails",
      ];

      const parameters = Object.keys(gameState);
      assertEquals(expectedParameters.length, parameters.length);
      assert(parameters.every((param) => expectedParameters.includes(param)));
      assertEquals(gameState.state, STATES.INITIAL_REINFORCEMENT);
    });

    it("Should return updated game state when game is initialize and troop initialization action is already done", () => {
      game.initTerritories();
      const gameState = game.getSavableGameState();
      const expectedParameters = [
        "activePlayerId",
        "activePlayerIndex",
        "territories",
        "players",
        "continents",
        "state",
        "cavalry",
        "hasCaptured",
        "round",
        "troops",
        "playersCount",
        "stateDetails",
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
    const game1 = createGame();
    game1.initTerritories();

    const initializedGameState = game1.getSavableGameState();

    it("Should reset the gameState when loaded with initialGameState", () => {
      const initialGameState = game.getSavableGameState();

      game.initTerritories();

      loadGameStateForTest(game, initialGameState);
      const loadedGameState = game.getSavableGameState();

      assertEquals(loadedGameState.state, STATES.INITIAL_REINFORCEMENT);
    });

    it("Should load the initialized game state when loaded with initializedGameState", () => {
      loadGameStateForTest(game, initializedGameState);
      const loadedGameState = game.getSavableGameState();
      assertEquals(loadedGameState.state, STATES.INITIAL_REINFORCEMENT);
    });
  });
});
