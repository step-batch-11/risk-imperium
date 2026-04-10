import {
  assert,
  assertEquals,
  assertStringIncludes,
  assertThrows,
} from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { handleGameSetup } from "../src/handler.js";
// import { handleUserActions } from "../src/handlers/passivePlayers.js";
import { STATES } from "../src/config.js";

import { loadGameStateForTest } from "./utilities.js";

import fortification from "../data/tests/fortification.json" with {
  type: "json",
};
import reinforce from "../data/tests/reinforce2.json" with { type: "json" };
import invasionState from "../data/tests/invasion.json" with { type: "json" };
import captureState from "../data/tests/capture.json" with { type: "json" };

import { createApp } from "../src/app.js";
import { createGame } from "../src/create_game.js";
import { fortificationService } from "../src/services/fortification.js";

describe("Api Handler", () => {
  let game;
  beforeEach(() => {
    game = createGame();
  });
  describe("handleGameSetup", () => {
    beforeEach(() => {
      game = createGame();
    });
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

  describe.ignore("handleUserActions", () => {
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
        header: () => {},
      };

      const res = await handleUserActions(context, "");

      const { action, data } = res;
      assertEquals(action, "WAITING");
      assertEquals(data.updatedTerritory.length, 1);
      const updatedTerritory = data.updatedTerritory[0];
      assertEquals(updatedTerritory.troopCount, 4);
      assertEquals(updatedTerritory.territoryId, 37);
    });

    it("SETUP : Should handle user actions when called", async () => {
      loadGameStateForTest(game, reinforce);
      const context = {
        get: () => game,
        req: {
          json: () => ({ userActions: "SETUP" }),
        },
        json: (data) => data,
      };

      const { action, data } = await handleUserActions(context, "", () => {});
      assertEquals(action, "REINFORCE");
      assertEquals(data.troopsToReinforce, 3);
    });
  });

  describe.ignore("INVADE", () => {
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

      const { newState, data } = await handleUserActions(context, "", () => {});

      assertEquals(newState, STATES.WAITING);
      assertEquals(data, {});
    });
  });

  describe.ignore("DEFEND", () => {
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

      handleUserActions(attackContext, "");

      const expectedData = {
        attackerTerritoryId: 16,
        defenderTerritoryId: 28,
        attackerTroops: 3,
        defenderTroops: 1,
        defenderId: 2,
        defenderTroopCount: 1,
        attackerDice: null,
        defenderDice: null,
      };

      const { action, data } = await handleUserActions(
        defendContext,
        "",
        () => {},
      );
      assertEquals(action, STATES.WAITING);
      assertEquals(expectedData.attackerTerritoryId, data.attackerTerritoryId);
      assertEquals(expectedData.defenderTerritoryId, data.defenderTerritoryId);
      assertEquals(expectedData.attackerTroops, data.attackerTroops);
      assertEquals(expectedData.defenderTroops, data.defenderTroopCount);
    });
  });

  describe.ignore("SKIP_FORTIFICATION", () => {
    it("should change game state to the reinforcement when currently in fortification state", async () => {
      let state = "FORTIFICATION";
      const game = {
        getGameState: () => {
          return state;
        },
        setNewState: (newState) => state = newState,
        updateGame: () => {},
        players: [],
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
      const data = await handleUserActions(context, "", () => {});

      assertEquals(data.action, STATES.GET_CARD);
    });

    it.ignore("shouldn't change game state to the reinforcement when not in fortification state", () => {
      const state = STATES.REINFORCE;
      const game = {
        getGameState: () => {
          return state;
        },
        players: [],
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

      assertThrows(() => handleUserActions(context, "", () => {}));
    });
  });

  describe.ignore("SKIP_INVASION", () => {
    it("should change game state to the reinforcement when currently in invasion state", async () => {
      let state = STATES.INVASION;
      const game = {
        skipInvasion: () => {
          state = STATES.FORTIFICATION;
        },
        getGameState: () => {
          return state;
        },
        players: [],
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

      const data = await handleUserActions(context, "", () => {});

      assertEquals(data.action, STATES.FORTIFICATION);
    });

    it("shouldn't change game state to the reinforcement when not in invasion state", () => {
      let state = STATES.SETUP;
      const game = {
        skipInvasion: () => {
          state = STATES.GET_CARD;
        },
        getGameState: () => {
          return state;
        },
        players: [],
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

      assertThrows(() => handleUserActions(context, "", () => {}));
    });
  });

  describe.ignore("FORTIFICATION", () => {
    it("Should return the new phase and updated territory when data is valid", () => {
      const expectedData = {
        updatedTerritories: [
          {
            territoryId: 28,
            troopCount: 5,
          },
          {
            territoryId: 30,
            troopCount: 5,
          },
        ],
      };

      loadGameStateForTest(game, fortification);

      const data = fortificationService(
        game,
        { from: 28, to: 30, count: 4 },
        "",
        [],
      );
      assertEquals(data, { action: STATES.GET_CARD, data: expectedData });
    });

    it("Should not return the new phase and shouldn't updated territory when from territory is invalid", () => {
      loadGameStateForTest(game, fortification);
      assertThrows(() =>
        fortificationService(game, { from: 28, to: 16, count: 9 })
      );
    });

    it("Should not return the new phase and shouldn't updated territory when to territory is invalid", () => {
      loadGameStateForTest(game, fortification);

      assertThrows(() =>
        fortificationService(game, { from: 22, to: 1, count: 9 })
      );
    });

    it("Should not return the new phase and shouldn't updated territory when both territory id are same", () => {
      loadGameStateForTest(game, fortification);

      assertThrows(() =>
        fortificationService(game, { from: 22, to: 22, count: 9 })
      );
    });

    it("Should return the previous phase when called without fortification phase", () => {
      assertThrows(() =>
        fortificationService(game, { from: 22, to: 22, count: 9 })
      );
    });
  });

  describe.ignore("Get card", () => {
    it("testing get card ", async () => {
      const game = {
        getCard: () => {
          return "2";
        },
        getGameState: () => "1",
        canGetCard: true,
        players: [],
        passToNextPlayer: () => {},
        stateDetails: {},
        hasCaptured: true,
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
      const data = await handleUserActions(context, "", () => {});
      const expected = { action: "WAITING", data: { card: "2" } };
      assertEquals(data.action, expected.action);

      assertEquals(data.data.card, expected.data.card);
    });
  });

  describe.ignore("CAPTURE", () => {
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
        hasEliminated: true,
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

      const data = await handleUserActions(context, "", () => {});

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
      assertEquals(headers.get("location"), "/");
      assertStringIncludes(headers.get("set-cookie"), "playerId");
    });
  });
  describe("LOBBY TESTS", () => {
    it("post  /quick-play should redirect to lobby and add the player to waiting list", async () => {
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
    it("post  /quick-play should create game if  waiting list is equal 3", async () => {
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
        playerDetails: [{ name: "alex" }, { name: "alice" }, { name: "resso" }],
        data: {
          id: 1,
          players: [{ name: "alex" }, { name: "alice" }, { name: "resso" }],
          status: "in-game",
        },
        isHost: false,
      };
      assertEquals(data, expected);
    });

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
