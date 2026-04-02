import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { handleGameSetup } from "../src/handler.js";
import { Game } from "../src/game.js";
import { handleUserActions } from "../src/handlers/user_actions.js";
import { ContinentsHandler } from "../src/models/continents_handler.js";
import { STATES } from "../src/config.js";

describe("Api Handler", () => {
  let game;
  beforeEach(() => {
    const continentsHandler = new ContinentsHandler();
    game = new Game(continentsHandler);
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
    it("should change game state to the reinforcement when currently in fortification state", async () => {
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
