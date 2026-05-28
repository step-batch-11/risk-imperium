import { beforeEach, describe, it } from "@std/testing/bdd";
import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { STATES } from "../src/config.js";
import aboutToWon from "../data/tests/about-to-win.json" with { type: "json" };
import defend from "../data/tests/defend.json" with { type: "json" };
import userShouldGetCard from "../data/tests/user_should_get_card.json" with {
  type: "json",
};
import lastTroopDeploy from "../data/tests/last-troop-deploy.json" with {
  type: "json",
};
import { loadGameStateForTest } from "./utilities.js";
import { createGame } from "../src/create_game.js";
import { ERROR_MESSAGE } from "../src/config/error_message.js";

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

  describe("Last Update", () => {
    it("should return the last action done in the game, when tried to access", () => {
      game.updateGame(
        STATES.CAPTURE,
        { data: "some data" },
        game.activePlayerId,
      );
      const lastUpdate = game.lastUpdate;
      assertEquals(lastUpdate, {
        action: STATES.CAPTURE,
        data: { data: "some data" },
        playerId: game.activePlayerId,
      });
    });
  });

  describe("Invade Details", () => {
    it("should the details about the invade/attack", () => {
      loadGameStateForTest(game, defend);

      const expected = {
        "attackerTerritoryId": 29,
        "attackerTroops": 3,
        "defenderTerritoryId": 31,
      };
      const actual = game.invadeDetail;
      assertEquals(expected, actual);
    });
  });

  describe("Is Latest Id", () => {
    it("should return true when provided id is latest", () => {
      const initialGameVersionId = 1;
      assert(game.isLatestId(initialGameVersionId));
    });
    it("should return false when provided id is not latest", () => {
      const previousId = 0;
      assertFalse(game.isLatestId(previousId));
    });
  });

  describe("get Setup", () => {
    it("should return the game data", () => {
      const gameVersionId = 0;
      const playerId = 1;
      const data = game.getUpdates(gameVersionId, playerId);
      const expectedKeys = [
        "continents",
        "territories",
        "player",
        "opponents",
        "currentPlayer",
        "cavalryPositions",
        "state",
      ];
      assert(Object.keys(data), expectedKeys);
    });
    it("should return basic details if eliminated user try to access the data", () => {
      const data = game.getUpdates();
      const expectedKey = ["territories", "opponents", "player"];
      assertEquals(expectedKey, Object.keys(data));
    });
    it("should return state waiting if player is not active player", () => {
      const gameVersionId = 0;
      const playerId = 2;
      const data = game.getUpdates(gameVersionId, playerId);
      assertEquals(data.state, STATES.WAITING);
    });
    it("should return state if player is active player", () => {
      const gameVersionId = 0;
      const playerId = 1;
      const data = game.getUpdates(gameVersionId, playerId);
      assertEquals(data.state, game.getGameState());
    });
  });

  describe("set New State", () => {
    it("should set the new state if give state is valid", () => {
      const state = game.setNewState(STATES.REINFORCE);
      assertEquals(state, STATES.REINFORCE);
      assertEquals(game.getGameState(), STATES.REINFORCE);
    });

    it("should throw if non defined state is given", () => {
      const error = assertThrows(() => game.setNewState("NON EXISTING STATE"));
      assertEquals(error.message, ERROR_MESSAGE.INVALID_STATE);
    });
  });

  describe("Can Get Card", () => {
    it("should return true when use had captured the territory", () => {
      const canGetCard = game.canGetCard;
      assertFalse(canGetCard);
    });

    it("should return false when use didn't captured any territory", () => {
      loadGameStateForTest(game, userShouldGetCard);
      const canGetCard = game.canGetCard;
      assert(canGetCard);
    });
  });

  describe("pass to next player", () => {
    it("should update id, state and change the turn", () => {
      game.passToNextPlayer();
      assertEquals(game.getGameState(), STATES.REINFORCE);
      assertEquals(game.version, 2);
      assertEquals(game.activePlayerId, 2);
    });
  });

  describe("Get Card", () => {
    it("should return a card when called", () => {
      const card = game.getCard();
      assert(["1", "2", "3", "4"].includes(card));
    });
  });

  describe("Is Player Defending", () => {
    it("should return false if state is not DEFEND", () => {
      assertFalse(game.isPlayerDefending(1));
    });

    it("should return false if state is DEFEND player is not a defender", () => {
      loadGameStateForTest(game, defend);
      const playerId = 1;
      assertFalse(game.isPlayerDefending(playerId));
    });

    it("should return true if state is DEFEND player is a defender", () => {
      loadGameStateForTest(game, defend);
      const playerId = 3;
      assert(game.isPlayerDefending(playerId));
    });
  });

  describe("Drop one troop", () => {
    it("should update to reinforce when last troop is deployed", () => {
      loadGameStateForTest(game, lastTroopDeploy);
      const left = game.dropOneTroop(1);
      assertEquals(left, 0);
      assertEquals(game.getGameState(), STATES.REINFORCE);
    });

    it("should return troops left when ", () => {
      const left = game.dropOneTroop(1);
      assertEquals(left, 12);
      assertEquals(game.getGameState(), STATES.INITIAL_REINFORCEMENT);
    });
  });

  describe("Get Player Territory", () => {
    it("should return player territories", () => {
      loadGameStateForTest(game, lastTroopDeploy);
      const playerTerritories = game.getPlayerTerritory(1);

      const expectedPlayerTerritories = [
        1,
        2,
        7,
        8,
        12,
        14,
        24,
        31,
        32,
        35,
        37,
        39,
        41,
        42,
      ];
      assertEquals(playerTerritories, expectedPlayerTerritories);
    });
    it("should throw error when invalid player Id is passed", () => {
      const error = assertThrows(() => game.getPlayerTerritory(0));
      assertEquals(error.message, ERROR_MESSAGE.INVALID_PARAMETERS);
    });
  });

  describe("getGameState", () => {
    it("Should return the current state of the game", () => {
      const state = game.getGameState();
      assertEquals(state, STATES.INITIAL_REINFORCEMENT);
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

  describe("Testing pass next player", () => {
    it("passToNextPlayer should change the state to reinforce change turn and update the version", () => {
      game.passToNextPlayer();
      assertEquals(game.getGameState(), STATES.REINFORCE);
    });
  });

  describe("Testing Get Card", () => {
    it("get card should return a random card", () => {
      assertEquals(
        game.getCard(() => 1),
        "4",
      );
    });

    it("can get card should return true if has captured is true", () => {
      assertEquals(game.canGetCard, game.stateDetails.hasCaptured);
    });
  });

  describe("removePlayer", () => {
    it("should remove a non-active player and leave active player unchanged", () => {
      const activeIdBefore = game.activePlayerId;
      const stateBefore = game.getGameState();
      const countBefore = game.players.length;

      game.removePlayer(2);

      assertEquals(game.players.length, countBefore - 1);
      assertEquals(game.activePlayerId, activeIdBefore);
      assertEquals(game.getGameState(), stateBefore);
      assertFalse(game.players.some((p) => p.id === 2));
    });

    it("should advance to next player's REINFORCE when active player leaves", () => {
      const activeIdBefore = game.activePlayerId;

      game.removePlayer(activeIdBefore);

      assertFalse(game.players.some((p) => p.id === activeIdBefore));
      assertEquals(game.getGameState(), STATES.REINFORCE);
    });

    it("should be a no-op when called with an unknown player id", () => {
      const countBefore = game.players.length;
      const activeIdBefore = game.activePlayerId;

      game.removePlayer(999);

      assertEquals(game.players.length, countBefore);
      assertEquals(game.activePlayerId, activeIdBefore);
    });

    it("should set lastUpdate action to LEAVE with the leaving player id", () => {
      const leavingId = 2;

      game.removePlayer(leavingId);

      assertEquals(game.lastUpdate.action, "LEAVE");
      assertEquals(game.lastUpdate.playerId, leavingId);
    });
  });
});
