import { beforeEach, describe, it } from "@std/testing/bdd";
import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { createApp } from "../src/app.js";
import { Hono } from "hono";
import { createGame } from "../src/create_game.js";
import { STATES } from "../src/config.js";
import { loadGameStateForTest } from "./utilities.js";
import defendState from "../data/tests/defend.json" with { type: "json" };
import reinforceState from "../data/tests/reinforce.json" with { type: "json" };
import invasionState from "../data/tests/invasion.json" with { type: "json" };

let app;

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
    const players = {
      1: "p1",
    };

    const gamesRepo = {
      get: () => game,
      has: () => true,
    };
    const app = createApp(gamesRepo, false, players);

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
      const players = {
        1: "p1",
      };

      const gamesRepo = {
        get: () => game,
        has: () => true,
      };
      app = createApp(gamesRepo, false, players);
    });
    it("REINFORCE user-actions should return updated troop count with their territory Id", async () => {
      loadGameStateForTest(game, reinforceState);
      const response = await app.request("/user-actions", {
        method: "POST",
        headers: {
          "content-type": "applications/json",
          cookie: "playerId=1;gameId=1",
        },
        body: JSON.stringify({
          userActions: "REINFORCE",
          data: { territoryId: 37, troopCount: 1 },
        }),
      });

      const { action, data } = await response.json();
      assertEquals(response.status, 200);
      assertEquals(response.ok, true);
      assertEquals(action, STATES.REINFORCE);
      assertEquals(data.updatedTerritory.length, 1);
      const updatedTerritory = data.updatedTerritory[0];
      assertEquals(updatedTerritory.territoryId, 37);
      assertEquals(updatedTerritory.troopCount, 2);
    });

    it("DEFEND should move game to RESOLVE_COMBAT after a valid invasion", async () => {
      loadGameStateForTest(game, defendState);
      const response = await app.request("/user-actions", {
        method: "POST",
        headers: {
          "content-type": "applications/json",
          cookie: "playerId=1;gameId=1",
        },
        body: JSON.stringify({
          userActions: "DEFEND",
          data: {
            territoryId: 2,
            troopCount: 1,
          },
        }),
      });

      const result = await response.json();
      assertEquals(response.status, 200);
      assertEquals(result.action, STATES.WAITING);
    });

    it("RESOLVE_COMBAT should resolve and update territories", async () => {
      loadGameStateForTest(game, invasionState);
      const cookie = "playerId=1;gameId=1";

      await app.request("/user-actions", {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({
          userActions: "INVADE",
          data: {
            attackerTerritoryId: 30,
            defenderTerritoryId: 31,
            attackerTroops: 2,
          },
        }),
      });

      await app.request("/user-actions", {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({
          userActions: STATES.DEFEND,
          data: { troopCount: 1 },
        }),
      });

      const response = await app.request("/user-actions", {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({
          userActions: STATES.RESOLVE_COMBAT,
          data: {},
        }),
      });

      const _result = await response.json();
      assertEquals(response.status, 200);
      // assertEquals(result.data.notifyMsg.status, "fail");
    });
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
      const game = createGame();
      app = createApp(game, false);
      const res = await app.request("/");
      await res.text();
    });
  });

  describe("DEV Mode", () => {
    describe("Load Game", () => {
      it("should provide a path for /;pad/:state for valid states in dev mode", async () => {
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

        const players = {};
        const lobbies = new Map();
        const gamesRepo = { get: () => game };

        const isDevMode = true;
        const app = createApp(gamesRepo, isDevMode, players, lobbies, {
          readTextFile: reader,
        });
        const res = await app.request(`/load/${configName}`);
        assertEquals(res.status, 302);
        assertEquals(configToLoad, `./data/states/${configName}.json`);
      });

      it("should provide not found for /:state for invalid states in dev mode", async () => {
        const game = {};
        const players = {};
        const lobbies = new Map();
        const gamesRepo = { get: () => game };

        const isDevMode = true;

        const app = createApp(gamesRepo, isDevMode, players, lobbies, {
          readTextFile: () =>
            new Promise((resolve) => {
              resolve(gameData);
            }),
        });

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

        const players = {};
        const lobbies = new Map();
        const gamesRepo = { get: () => game };

        const isDevMode = true;

        const app = createApp(gamesRepo, isDevMode, players, lobbies, {
          readTextFile: () =>
            new Promise((resolve) => {
              resolve(gameData);
            }),
          writeTextFile: writer,
        });

        const res = await app.request(`/save/${configName}`);

        assertEquals(res.status, 302);
        assertEquals(actualStoringPath, `./data/states/${configName}.json`);
        assertEquals(actualStoringData, JSON.stringify(gameData));
      });
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
      assertEquals(headers.get("location"), "/");
      assertStringIncludes(headers.get("set-cookie"), "playerId");
    });

    it("post /logout should delete cookies amd redirect to login", async () => {
      const app = createApp({}, false, {}, {});
      const response = await app.request("/logout", { method: "POST" });
      assertEquals(response.status, 302);
      assertEquals(response.headers.get("location"), "/login.html");
    });
  });

  describe("LOBBY TESTS", () => {
    describe("QUICK PLAY", () => {
      it("post /quick-play should redirect to lobby and add the player to waiting list", async () => {
        const players = { 1: "alex" };
        const lobbies = new Map();
        const app = createApp({}, false, players, lobbies);
        const res = await app.request("/quick-play", {
          method: "POST",
          headers: {
            cookie: "playerId=1",
          },
        });
        assertEquals(res.status, 302);
        assertEquals(res.headers.get("location"), "/lobby.html");
      });

      it("post /quick-play should create game if  waiting list is equal 3", async () => {
        const players = { 1: "alex", 2: "lisa" };
        const lobbies = new Map();
        lobbies.set(1, {
          id: 1,
          players: [{ id: 3 }, { id: 2 }],
          status: "waiting",
        });
        const gamesRepo = new Map();
        const app = createApp(gamesRepo, false, players, lobbies);
        const res = await app.request("/quick-play", {
          method: "POST",
          headers: {
            cookie: "playerId=1",
          },
        });
        assertEquals(res.status, 302);
        assertEquals(res.headers.get("location"), "/lobby.html");
        assertEquals(lobbies.get(1).status, "in-game");
      });
    });

    describe("LOBBY DATA", () => {
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
        const expected = {
          playerDetails: [{ name: "alex" }, { name: "alice" }],
          data: {
            id: 1,
            players: [{ name: "alex" }, { name: "alice" }],
            status: "waiting",
          },
          isHost: false,
        };
        assertEquals(data, expected);
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

        const expected = {
          playerDetails: [
            { name: "alex" },
            { name: "alice" },
            { name: "resso" },
          ],
          data: {
            id: 1,
            players: [{ name: "alex" }, { name: "alice" }, { name: "resso" }],
            status: "in-game",
          },
          isHost: false,
        };
        assertEquals(data, expected);
      });
    });

    describe("LEAVE LOBBY", () => {
      it("/leave lobby should pop the player from lobby, delete the cookies and return the success status", async () => {
        const players = { 1: "alex", 2: "lisa" };
        const lobbies = new Map();
        lobbies.set(1, {
          id: 1,
          players: [{ id: 3 }, { id: 1 }, { id: 2 }],
          status: "waiting",
        });

        const gamesRepo = new Map();
        const app = createApp(gamesRepo, false, players, lobbies);
        const res = await app.request("/leave-lobby", {
          method: "POST",
          headers: {
            cookie: "playerId=1;lobbyId=1",
          },
        });

        const headers = res.headers;

        assertEquals(res.status, 200);
        const { action, data } = await res.json();
        assertEquals(action, "LEAVE");
        assert(data.success);
        assertStringIncludes(headers.get("set-cookie"), "lobbyId=; Max-Age=0");
      });
    });
  });
});
