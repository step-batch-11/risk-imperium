import { assertEquals, assertStringIncludes } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { handleGameSetup } from "../src/handler.js";
import { Game } from "../src/game.js";
import { handleUserActions } from "../src/handlers/user_actions.js";
import { ContinentsHandler } from "../src/models/continents_handler.js";
import { CONFIG, STATES } from "../src/config.js";
import { fortificationHandler } from "../src/models/fortification_handler.js";
import { mockPlayers } from "../src/mock_data.js";
import { FortificationController } from "../src/handlers/fortification_controller.js";
import { Cards } from "../src/models/cards.js";
import { Cavalry } from "../src/models/cavalry.js";
import { TerritoriesHandler } from "../src/models/territoryHandler.js";
import { InitialReinforcementController } from "../src/handlers/initial_reinforcement_controller.js";
import { ReinforcementController } from "../src/handlers/reinforcement_controller.js";
import { InvasionController } from "../src/handlers/invasion_controller.js";
import { loadGameStateForTest } from "./utilities.js";

import fortification from "../data/tests/fortification.json" with {
  type: "json",
};
import invasionState from "../data/tests/invasion.json" with { type: "json" };
import captureState from "../data/tests/capture.json" with { type: "json" };

import { createApp } from "../src/app.js";

describe("Api Handler", () => {
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

  describe("INVADE", () => {
    it("should change the game state to defend after attacking", async () => {
      loadGameStateForTest(game, invasionState);
      const mockData = {
        attackerTerritoryId: 16,
        defenderTerritoryId: 28,
        attackerTroops: 3,
      };

      const context = {
        get: () => game,
        req: {
          json: () => ({ userActions: "INVADE", data: mockData }),
        },
        json: (data) => data,
      };

      const { newState, data } = await handleUserActions(context);

      assertEquals(newState, STATES.DEFEND);
      assertEquals(data, {});
    });
  });

  describe("DEFEND", () => {
    it("should change the game state to RESOLVE_COMBAT after defending", async () => {
      loadGameStateForTest(game, invasionState);
      const mockData = {
        territoryId: 28,
        troopCount: 1,
      };

      const attackData = {
        attackerTerritoryId: 16,
        defenderTerritoryId: 28,
        attackerTroops: 3,
      };

      const defendContext = {
        get: () => game,
        req: {
          json: () => ({ userActions: "DEFEND", data: mockData }),
        },
        json: (data) => data,
      };

      const attackContext = {
        get: () => game,
        req: {
          json: () => ({ userActions: "INVADE", data: attackData }),
        },
        json: (data) => data,
      };

      handleUserActions(attackContext);

      const expectedData = {
        attackerTerritoryId: 16,
        defenderTerritoryId: 28,
        attackerTroops: 3,
        defenderTroops: 1,
        attackerDice: null,
        defenderDice: null,
      };

      const { action, data } = await handleUserActions(defendContext);
      assertEquals(action, STATES.RESOLVE_COMBAT);
      assertEquals(data, expectedData);
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
      let state = STATES.SETUP;
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
      assertEquals(data.action, STATES.SETUP);
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
      let state = STATES.SETUP;
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
      assertEquals(data.action, STATES.SETUP);
    });
  });

  describe("FORTIFICATION", () => {
    it("Should return the new phase and updated territory when data is valid", () => {
      const expectedData = [
        {
          territoryId: 28,
          troopCount: 5,
        },
        {
          territoryId: 30,
          troopCount: 5,
        },
      ];

      loadGameStateForTest(game, fortification);

      const data = fortificationHandler(game, { from: 28, to: 30, count: 4 });
      assertEquals(data, { action: STATES.GET_CARD, data: expectedData });
    });

    it("Should not return the new phase and shouldn't updated territory when from territory is invalid", () => {
      const expectedData = [];
      loadGameStateForTest(game, fortification);
      const data = fortificationHandler(game, { from: 28, to: 16, count: 9 });
      assertEquals(data, { action: STATES.FORTIFICATION, data: expectedData });
    });

    it("Should not return the new phase and shouldn't updated territory when to territory is invalid", () => {
      const expectedData = [];
      loadGameStateForTest(game, fortification);

      const data = fortificationHandler(game, { from: 22, to: 1, count: 9 });
      assertEquals(data, { action: STATES.FORTIFICATION, data: expectedData });
    });

    it("Should not return the new phase and shouldn't updated territory when both territory id are same", () => {
      const expectedData = [];
      loadGameStateForTest(game, fortification);

      const data = fortificationHandler(game, { from: 22, to: 22, count: 9 });
      assertEquals(data, { action: STATES.FORTIFICATION, data: expectedData });
    });

    it("Should return the previous phase when called without fortification phase", () => {
      const expectedData = [];
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
        getGameState: () => "1",
        canGetCard: true,
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
      assertEquals(data, { action: "1", data: { card: "2" } });
    });
  });

  describe("CAPTURE", () => {
    it("should return true", async () => {
      loadGameStateForTest(game, captureState);
      const context = {
        get: (name) => {
          if (name === "game") {
            return game;
          }
        },

        req: {
          json: () => ({
            userActions: STATES.CAPTURE,
            data: 3,
          }),
        },
        json: (data) => data,
      };

      const expectedData = {
        hasEliminated: false,
        hasWon: false,
        newCards: [],
        updatedTerritories: [
          {
            territoryId: 16,
            troopCount: 4,
          },
          {
            territoryId: 35,
            troopCount: 6,
          },
        ],
      };
      const data = await handleUserActions(context);
      assertEquals(data, { action: STATES.INVASION, data: expectedData });
    });
  });

  describe("auth", () => {
    it("post /login should set cookie amd redirect to home", async () => {
      const fd = new FormData();
      fd.set("username", "himu");
      const app = createApp({}, false, {}, []);
      const res = await app.request("/login", {
        method: "POST",
        body: fd,
      });
      assertEquals(res.status, 302);
      const headers = res.headers;
      assertEquals(headers.get("location"), "/home.html");
      assertStringIncludes(headers.get("set-cookie"), "playerId=1");
    });

    it("post  /start game should redirect to lobby and add the player to waiting list", async () => {
      const players = { "1": "alex" };
      const lobbies = new Map();
      const app = createApp({}, false, players, lobbies);
      const res = await app.request("/start-game", {
        method: "POST",
        headers: {
          cookie: "playerId=1",
        },
      });
      assertEquals(res.status, 302);
      assertEquals(res.headers.get("location"), "/lobby.html");
    });
    it("post  /start game should create game if  waiting list is equal 3", async () => {
      const players = { "1": "alex", "2": "lisa" };
      const lobbies = new Map();
      lobbies.set(1, {
        id: 1,
        players: [{ id: 3 }, { id: 2 }],
        status: "waiting",
      });
      const gamesRepo = new Map();
      const app = createApp(gamesRepo, false, players, lobbies);
      const res = await app.request("/start-game", {
        method: "POST",
        headers: {
          cookie: "playerId=1",
        },
      });
      assertEquals(res.status, 302);
      assertEquals(res.headers.get("location"), "/lobby.html");
      assertEquals(lobbies.get(1).status, "in-game");
    });

    it("get /get-lobby-data should get the lobbby data and should start game ", async () => {
      const lobbies = new Map();
      lobbies.set(1, {
        id: 1,
        players: [{ name: "alex" }, { name: "alice" }],
        status: "waiting",
      });
      const app = createApp({}, false, [], lobbies);
      const res = await app.request("/get-lobby-data", {
        headers: {
          cookie: "lobbyId=1",
        },
      });
      assertEquals(res.status, 200);
      const data = await res.json();
      assertEquals(data, {
        playerList: ["alex", "alice"],
        start: false,
      });
    });
    it("get /get-lobby-data should get the lobbby data and should start game ", async () => {
      const lobbies = new Map();
      lobbies.set(1, {
        id: 1,
        players: [{ name: "alex" }, { name: "alice" }, { name: "resso" }],
        status: "in-game",
      });
      const app = createApp({}, false, [], lobbies);
      const res = await app.request("/get-lobby-data", {
        headers: { cookie: "lobbyId=1" },
      });

      assertEquals(res.status, 200);
      const data = await res.json();
      assertEquals(data, {
        playerList: ["alex", "alice", "resso"],
        start: true,
      });
    });
  });
});
