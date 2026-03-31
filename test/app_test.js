import { describe, it } from "@std/testing/bdd";
import { assert, assertEquals, assertFalse } from "@std/assert";
import { createApp } from "../src/app.js";
import { Hono } from "hono";
import { Game } from "../src/game.js";
import { STATES } from "../src/config.js";

it("Create app should return the instance of the Hono class", () => {
  const app = createApp({});
  const isHonoInstance = app instanceof Hono;
  assert(isHonoInstance);
});

describe("App Handler", () => {
  it("`GET /setup` should return the setup data for the user", async () => {
    const game = {
      getSetup(id) {
        return { data: "Game Setup Data", id };
      },
    };
    const app = createApp(game);
    const response = await app.request("/setup");
    const data = await response.json();

    assertEquals(response.status, 200);
    assertEquals(data, { data: "Game Setup Data", id: 1 });
  });

  describe("POST /user-actions", () => {
    it("REINFORCE user-actions should return updated troop count with their territory Id", async () => {
      const game = new Game();
      game.initTerritories();
      const gameState = game.getSetup();
      gameState.state = STATES.INITIAL_REINFORCEMENT;
      const app = createApp(game);
      const response = await app.request("/user-actions", {
        method: "POST",
        headers: { "content-type": "applications/json" },
        body: JSON.stringify({
          "userActions": "REINFORCE",
          data: { territoryId: 37, troopCount: 1 },
        }),
      });

      const { action, data } = await response.json();
      assertEquals(response.status, 200);
      assertEquals(response.ok, true);
      assertEquals(action, "INITIAL_REINFORCEMENT");
      assertEquals(data.territoryId, 37);
      assertEquals(data.newTroopCount, 2);
    });
  });

  describe("Logger", () => {
    it("Should call the logger when it is passed", async () => {
      const game = new Game();
      let isCalled = false;
      const mockLogger = () => {
        return async (_, next) => {
          isCalled = true;
          await next();
        };
      };
      const app = createApp(game, false, mockLogger);

      const res = await app.request("/");
      res.text();
      assert(isCalled);
    });

    it("Should not throw error when no logger passed", async () => {
      const game = new Game();
      const app = createApp(game, false);
      const res = await app.request("/");
      await res.text();
    });
  });
  describe("DEV Mode", () => {
    it("should provide a path for /:state for valid states in dev mode", async () => {
      const game = {};
      const app = createApp(game, true);
      const res = await app.request("/start-no-setup");
      assertEquals(res.status, 302);
    });

    it("should provide not found for /:state for invalid states in dev mode", async () => {
      const game = {};
      const app = createApp(game, true);
      const res = await app.request("/non-existing-setup");
      assertEquals(res.status, 404);
      await res.text();
    });
    it("Should load the new state when valid state requirement is called", async () => {
      let loadedState;
      const game = {
        loadGameState: (state) => {
          loadedState = state;
        },
      };
      const app = createApp(game, true);
      const res = await app.request("/init-reinforced");
      assertEquals(res.status, 302);

      const expectedParameters = [
        "activePlayerId",
        "territory",
        "players",
        "continents",
        "state",
        "stateDetails",
      ];
      const parameters = Object.keys(loadedState);
      assertEquals(expectedParameters.length, parameters.length);
      assert(parameters.every((param) => expectedParameters.includes(param)));
    });

    it("Should load the new state when valid state requirement is called with start-no-setup", async () => {
      let isNewStateLoaded = false;
      const game = {
        loadGameState: (_) => {
          isNewStateLoaded = true;
        },
      };
      const app = createApp(game, true);
      const res = await app.request("/start-no-setup");
      assertEquals(res.status, 302);
      assertFalse(isNewStateLoaded);
    });

    it("Should load the new state when valid state requirement is called with start", async () => {
      let initIsCalled = false;
      const game = {
        initTerritories: () => {
          initIsCalled = true;
        },
      };
      const app = createApp(game, true);
      const res = await app.request("/start");
      assertEquals(res.status, 302);

      assert(initIsCalled);
    });
  });
});
