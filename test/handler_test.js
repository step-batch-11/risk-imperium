import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { handleGameSetup } from "../src/handler.js";
import { Game } from "../src/game.js";
import { handleUserActions } from "../src/handlers/user_actions.js";
import { ContinentsHandler } from "../src/models/continents_handler.js";
import { CONFIG, STATES } from "../src/config.js";
import { fortificationHandler } from "../src/handlers/fortification_handler.js";
import fortification from "../data/states/fortification.json" with {
  type: "json",
};
import { mockPlayers } from "../src/mock_data.js";
import { FortificationHandler } from "../src/models/fortification_handler.js";

describe("Api Handler", () => {
  let game;
  beforeEach(() => {
    const continentsHandler = new ContinentsHandler();
    game = new Game(mockPlayers(), CONFIG.TERRITORIES, { continentsHandler }, {
      random: () => 0.3,
    });
  });
  describe("handleGameSetup", () => {
    it("Should return the game setup data when called", () => {
      const setupData = { data: "this is the setup Data" };
      const store = {
        game: {
          getSetup: () => setupData,
        },
      };
      const context = {
        get: (item) => store[item],
        json: (data) => data,
      };

      const actualSetupData = handleGameSetup(context);
      assertEquals(actualSetupData, setupData);
    });
  });

  describe("handleUserActions", () => {
    it("Should handle user actions when called", async () => {
      game.initTerritories();
      const context = {
        get: () => game,
        req: {
          json: () => ({
            userActions: "REINFORCE",
            data: { territoryId: 37, troopCount: 1 },
          }),
        },
        json: (data) => data,
      };

      const { action, data } = await handleUserActions(context);

      assertEquals(action, "INITIAL_REINFORCEMENT");

      assertEquals(data.updatedTerritory.length, 1);
      const updatedTerritory = data.updatedTerritory[0];
      assertEquals(updatedTerritory.troopCount, 2);
      assertEquals(updatedTerritory.territoryId, 37);
    });

    it("Should catch an error when error occurred", async () => {
      const context = { json: (x) => x };
      const { msg } = await handleUserActions(context);
      assertEquals("context.get is not a function", msg);
    });

    it("SETUP : Should handle user actions when called", async () => {
      game.initTerritories();
      for (let i = 1; i <= 13; i++) {
        game.reinforce({ territoryId: 37, troopCount: 1 });
      }

      const context = {
        get: () => game,
        req: {
          json: () => ({ userActions: "SETUP" }),
        },
        json: (data) => data,
      };

      const { action, data } = await handleUserActions(context);

      assertEquals(action, "REINFORCE");
      assertEquals(data.troopsToReinforce, 3);
    });
  });

  describe("SKIP_FORTIFICATION", () => {
    it("should change game state to the reinforcement when currently in fortification state", async () => {
      let state = "FORTIFICATION";
      const game = {
        skipFortification: () => {
          state = "REINFORCE";
        },
        getGameState: () => {
          return state;
        },
      };

      const context = {
        get: (name) => {
          if (name === "game") {
            return game;
          }
        },
        req: {
          json: () => ({ userActions: STATES.SKIP_FORTIFICATION, data: [] }),
        },
        json: (data) => data,
      };
      const data = await handleUserActions(context);
      assertEquals(data.action, STATES.REINFORCE);
    });

    it("shouldn't change game state to the reinforcement when not in fortification state", async () => {
      let state = "WAITING";
      const game = {
        skipFortification: () => {
          state = "REINFORCE";
        },
        getGameState: () => {
          return state;
        },
      };

      const context = {
        get: (name) => {
          if (name === "game") {
            return game;
          }
        },
        req: {
          json: () => ({ userActions: STATES.SKIP_FORTIFICATION, data: [] }),
        },
        json: (data) => data,
      };
      const data = await handleUserActions(context);
      assertEquals(data.action, STATES.WAITING);
    });
  });

  describe("SKIP_INVASION", () => {
    it("should change game state to the reinforcement when currently in invasion state", async () => {
      let state = STATES.INVASION;
      const game = {
        skipInvasion: () => {
          state = STATES.FORTIFICATION;
        },
        getGameState: () => {
          return state;
        },
      };

      const context = {
        get: (name) => {
          if (name === "game") {
            return game;
          }
        },
        req: {
          json: () => ({ userActions: STATES.SKIP_INVASION, data: [] }),
        },
        json: (data) => data,
      };

      const data = await handleUserActions(context);

      assertEquals(data.action, STATES.FORTIFICATION);
    });

    it("shouldn't change game state to the reinforcement when not in invasion state", async () => {
      let state = STATES.WAITING;
      const game = {
        skipInvasion: () => {
          state = STATES.GET_CARD;
        },
        getGameState: () => {
          return state;
        },
      };

      const context = {
        get: (name) => {
          if (name === "game") {
            return game;
          }
        },
        req: {
          json: () => ({ userActions: STATES.SKIP_INVASION, data: [] }),
        },
        json: (data) => data,
      };

      const data = await handleUserActions(context);
      assertEquals(data.action, STATES.WAITING);
    });
  });

  describe("FORTIFICATION", () => {
    it("Should return the new phase and updated territory when data is valid", () => {
      const expectedData = [
        {
          territoryId: 22,
          troopCount: 1,
        },
        {
          territoryId: 16,
          troopCount: 10,
        },
      ];

      const savedState = fortification;
      const handler = {
        fortificationHandler: new FortificationHandler(savedState.territories),
      };
      game.loadGameState(savedState, handler);

      const data = fortificationHandler(game, { from: 22, to: 16, count: 9 });
      assertEquals(data, { action: STATES.GET_CARD, data: expectedData });
    });

    it("Should not return the new phase and shouldn't updated territory when from territory is invalid", () => {
      const expectedData = [];
      game.loadGameState(fortification);
      const data = fortificationHandler(game, { from: 1, to: 16, count: 9 });
      assertEquals(data, { action: STATES.FORTIFICATION, data: expectedData });
    });

    it("Should not return the new phase and shouldn't updated territory when to territory is invalid", () => {
      const expectedData = [];
      game.loadGameState(fortification);
      const data = fortificationHandler(game, { from: 22, to: 1, count: 9 });
      assertEquals(data, { action: STATES.FORTIFICATION, data: expectedData });
    });

    it("Should not return the new phase and shouldn't updated territory when both territory id are same", () => {
      const expectedData = [];
      game.loadGameState(fortification);
      const data = fortificationHandler(game, { from: 22, to: 22, count: 9 });
      assertEquals(data, { action: STATES.FORTIFICATION, data: expectedData });
    });

    it("Should return the previous phase when called without fortification phase", () => {
      const expectedData = [];
      game;
      const data = fortificationHandler(game, { from: 22, to: 22, count: 9 });
      assertEquals(data, { action: STATES.SETUP, data: expectedData });
    });
  });

  describe("Get card", () => {
    it("testing get card ", async () => {
      const game = {
        getCard: () => {
          return "2";
        },
      };
      const context = {
        get: (name) => {
          if (name === "game") {
            return game;
          }
        },
        req: {
          json: () => ({ userActions: STATES.GET_CARD, data: [] }),
        },
        json: (data) => data,
      };
      const data = await handleUserActions(context);
      assertEquals(data, "2");
    });
  });
});
