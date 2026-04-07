import { beforeEach, describe, it } from "@std/testing/bdd";
import { assert, assertEquals } from "@std/assert";
import { createApp } from "../src/app.js";
import { Hono } from "hono";
import { Game } from "../src/game.js";
import { CONFIG } from "../src/config.js";
import { ContinentsHandler } from "../src/models/continents_handler.js";
import { mockPlayers } from "../src/mock_data.js";
import { Cavalry } from "../src/models/cavalry.js";
import { FortificationController } from "../src/handlers/fortification_controller.js";
import { Cards } from "../src/models/cards.js";
import { TerritoriesHandler } from "../src/models/territoryHandler.js";
import { InitialReinforcementController } from "../src/handlers/initial_reinforcement_controller.js";
import { ReinforcementController } from "../src/handlers/reinforcement_controller.js";
import { InvasionController } from "../src/handlers/invasion_controller.js";

const createGame = () => {
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
  return game;
};
let app;

it("Create app should return the instance of the Hono class", () => {
  const app = createApp({});
  const isHonoInstance = app instanceof Hono;
  assert(isHonoInstance);
});

describe("App Handler", () => {
  beforeEach(() => {
  });

  it("`GET /setup` should return the setup data for the user", async () => {
    const game = {
      getSetup(id) {
        return { data: "Game Setup Data", id };
      },
    };

    const gamesRepo = {
      get: () => game,
    };
    const app = createApp(gamesRepo);

    const response = await app.request("/setup", {
      headers: {
        cookie: "gameId=1;playerId=1",
      },
    });

    const data = await response.json();

    assertEquals(response.status, 200);
    assertEquals(data, { data: "Game Setup Data", id: 1 });
  });

  describe("POST /user-actions", () => {
    let app;
    let game;
    beforeEach(() => {
      game = createGame();
      game.initTerritories();

      const gamesRepo = {
        get: () => game,
      };

      app = createApp(gamesRepo);
    });
    it("REINFORCE user-actions should return updated troop count with their territory Id", async () => {
      const response = await app.request("/user-actions", {
        method: "POST",
        headers: { "content-type": "applications/json" },
        body: JSON.stringify({
          userActions: "REINFORCE",
          data: { territoryId: 37, troopCount: 1 },
        }),
      });

      const { action, data } = await response.json();
      assertEquals(response.status, 200);
      assertEquals(response.ok, true);
      assertEquals(action, "INITIAL_REINFORCEMENT");
      assertEquals(data.updatedTerritory.length, 1);
      const updatedTerritory = data.updatedTerritory[0];
      assertEquals(updatedTerritory.territoryId, 37);
      assertEquals(updatedTerritory.troopCount, 2);
    });

    // it("DEFEND should move game to RESOLVE_COMBAT after a valid invasion", async () => {
    //   const response = await app.request("/user-actions", {
    //     method: "POST",
    //     headers: { "content-type": "application/json" },
    //     body: JSON.stringify({
    //       userActions: "DEFEND",
    //       data: {
    //         territoryId: 2,
    //         troopCount: 1,
    //       },
    //     }),
    //   });

    //   const result = await response.json();
    //   assertEquals(response.status, 200);
    //   assertEquals(result.action, STATES.RESOLVE_COMBAT);
    // });

    // it("RESOLVE_COMBAT should resolve and update territories", async () => {
    //   await app.request("/user-actions", {
    //     method: "POST",
    //     headers: { "content-type": "application/json" },
    //     body: JSON.stringify({
    //       userActions: "INVADE",
    //       data: {
    //         attackerTerritoryId: 35,
    //         defenderTerritoryId: 16,
    //         attackerTroops: 3,
    //       },
    //     }),
    //   });

    //   await app.request("/user-actions", {
    //     method: "POST",
    //     headers: { "content-type": "application/json" },
    //     body: JSON.stringify({
    //       userActions: STATES.DEFEND,
    //       data: { troopCount: 3 },
    //     }),
    //   });

    //   const response = await app.request("/user-actions", {
    //     method: "POST",
    //     headers: { "content-type": "application/json" },
    //     body: JSON.stringify({
    //       userActions: STATES.RESOLVE_COMBAT,
    //       data: {},
    //     }),
    //   });

    //   const result = await response.json();
    //   assertEquals(response.status, 200);
    //   assertEquals(result.data.notifyMsg.status, "fail");
    //   // assertEquals(result.action, STATES.`INVASION`);
    // });
  });

  describe("Logger", () => {
    let game;
    beforeEach(() => {
      game = createGame();
      game.initTerritories();
    });
    it("Should call the logger when it is passed", async () => {
      let isCalled = false;
      const mockLogger = () => {
        return async (_, next) => {
          isCalled = true;
          await next();
        };
      };
      app = createApp(game, false, [], [], {
        logger: mockLogger,
        readTextFileSync: () => {},
      });

      const res = await app.request("/");
      res.text();
      assertEquals(isCalled, true);
    });

    it("Should not throw error when no logger passed", async () => {
      const game = new Game();
      app = createApp(game, false);
      const res = await app.request("/");
      await res.text();
    });
  });

  describe.ignore("DEV Mode", () => {
    // let app;
    // let game;
    // beforeEach(() => {
    //   game = createGame()
    //   game.initTerritories();

    //   const gamesRepo = {
    //     get: () => game
    //   }

    //   app = createApp(gamesRepo, true, [], [], {logger, });
    // })
    describe("Load Game", () => {
      it("should provide a path for /:state for valid states in dev mode", async () => {
        const configName = "start-no-setup";
        let configToLoad = null;

        const reader = async (fileName) => {
          configToLoad = await fileName;
          return JSON.stringify({});
        };

        const game = {
          loadGameState: (data) => {
            assertEquals(data, {});
          },
        };
        const app = createApp(game, true, [], [], { readTextFile: reader });
        const res = await app.request(`/load/${configName}`);
        assertEquals(res.status, 302);
        assertEquals(configToLoad, `./data/states/${configName}.json`);
      });

      it("should provide not found for /:state for invalid states in dev mode", async () => {
        const game = {};
        const reader = async () => {
          throw await new Error("Not found");
        };

        const app = createApp(game, true, { readTextFile: reader });
        const res = await app.request("/load/non-existing-setup");
        assertEquals(res.status, 404);
        await res.text();
      });
    });

    describe("Save Game", () => {
      it("should provide a path for /save/:name for in dev mode to store gameState", async () => {
        let actualStoringPath = null;
        let actualStoringData = null;

        const configName = "sampleSave";
        const gameData = { data: "Some game state" };

        const writer = (path, data) => {
          actualStoringPath = path;
          actualStoringData = data;
        };

        const game = {
          getSavableGameState: () => {
            return gameData;
          },
        };

        const app = createApp(game, true, { writeTextFile: writer });
        const res = await app.request(`/save/${configName}`);
        assertEquals(res.status, 302);
        assertEquals(actualStoringPath, `./data/states/${configName}.json`);
        assertEquals(actualStoringData, JSON.stringify(gameData));
      });
    });
  });
});
