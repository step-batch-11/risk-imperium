import {
  assert,
  assertEquals,
  assertFalse,
  assertStringIncludes,
  assertThrows,
} from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { handleGameSetup } from "../src/handler.js";
import { STATES } from "../src/config.js";
import { loadGameStateForTest } from "./utilities.js";
import fortification from "../data/tests/fortification.json" with {
  type: "json",
};
import reinforce from "../data/tests/reinforce2.json" with { type: "json" };
import initReinforceState from "../data/tests/init_reinforce.json" with {
  type: "json",
};
import invasionState from "../data/tests/invasion.json" with { type: "json" };
import defendState from "../data/tests/defend2.json" with { type: "json" };
import captureState from "../data/tests/capture.json" with { type: "json" };
import { createGame } from "../src/create_game.js";
import { fortificationService } from "../src/services/fortification.js";
import { gameController } from "../src/handlers/user_actions.js";
import { ERROR_MESSAGE } from "../src/config/error_message.js";
import {
  broadCastNewUpdates,
  handleWaiting,
} from "../src/handlers/passivePlayers.js";
import { mockPlayers } from "../src/mock_data.js";
import { createApp } from "../src/app.js";
import { logoutHandler } from "../src/handlers/auth.js";

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

  describe("gameController", () => {
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

      const res = await gameController(context, "");

      const { action, data } = res;
      assertEquals(action, "WAITING");
      assertEquals(data.updatedTerritory.length, 1);
      const updatedTerritory = data.updatedTerritory[0];
      assertEquals(updatedTerritory.troopCount, 3);
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

      const { action, data } = await gameController(context, "", () => {});
      assertEquals(action, "REINFORCE");
      assertEquals(data.troopsToReinforce, 4);
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

      const { newState, data } = await gameController(context, "", () => {});

      assertEquals(newState, STATES.WAITING);
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

      gameController(attackContext, "");

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

      const { action, data } = await gameController(
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

  describe("SKIP_FORTIFICATION", () => {
    it("should change game state to the reinforcement when currently in fortification state", async () => {
      let state = "FORTIFICATION";
      const game = {
        getGameState: () => {
          return state;
        },
        setNewState: (newState) => (state = newState),
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
      const data = await gameController(context, "", () => {});

      assertEquals(data.action, STATES.GET_CARD);
    });

    it("shouldn't change game state to the reinforcement when not in fortification state", async () => {
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
      const error = await gameController(context, "", () => {});
      assertEquals(error.msg, ERROR_MESSAGE.INVALID_ACTION);
    });
  });

  describe("SKIP_INVASION", () => {
    it("should change game state to the reinforcement when currently in invasion state", async () => {
      let state = STATES.INVASION;
      const game = {
        skipInvasion: () => {
          state = STATES.FORTIFICATION;
        },
        setNewState: () => (state = STATES.FORTIFICATION),
        getGameState: () => {
          return state;
        },

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
          json: () => ({ userActions: STATES.SKIP_INVASION, data: [] }),
        },
        json: (data) => data,
      };

      const data = await gameController(context, "", () => {});

      assertEquals(data.action, STATES.FORTIFICATION);
    });

    it("shouldn't change game state to the reinforcement when not in invasion state", async () => {
      let state = "INVALID";
      const game = {
        skipInvasion: () => {
          state = STATES.GET_CARD;
        },
        setNewState: () => (state = STATES.FORTIFICATION),
        updateGame: () => {},
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

      const error = await gameController(context, "", () => {});
      assertEquals(error.msg, ERROR_MESSAGE.INVALID_ACTION);
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
            territoryId: 16,
            troopCount: 5,
          },
        ],
      };

      loadGameStateForTest(game, fortification);

      const data = fortificationService(
        game,
        { from: 28, to: 16, count: 5 },
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

  describe("Get card", () => {
    it("testing get card ", async () => {
      const game = {
        getCard: () => {
          return "2";
        },
        addCardToPlayerHand: () => {},
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
      const data = await gameController(context, "", () => {});
      const expected = { action: "WAITING", data: { card: "2" } };
      assertEquals(data.action, expected.action);

      assertEquals(data.data.card, expected.data.card);
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

      const data = await gameController(context, "", () => {});

      assertEquals(data, { action: STATES.INVASION, data: expectedData });
    });
  });

  describe("BoardCast Test", () => {
    it("Board Cast should call the resolve function of all the players and set the resolver to null", () => {
      class Player {
        constructor() {
          this.isCalled = false;
          this.resolve = this.resolve.bind(this);
        }

        resolve() {
          this.isCalled = true;
        }
      }

      const players = Array.from({ length: 6 }, () => new Player());

      broadCastNewUpdates(players);

      assert(players.every((player) => player.isCalled));
      assert(players.every((player) => !player.resolve));
    });
  });

  describe("Passive Player action", () => {
    describe("Different version id", () => {
      it("Passive handler should delete the gameId, lobbyId from cookies and return updates along with state as eliminated", async () => {
        const game = {
          players: mockPlayers(),
          getUpdates: () => "UPDATES",
        };

        const store = {
          game,
        };
        const cookies = {
          "game-version": "1",
        };

        const mockGetCookieFn = (context, key) => context.cookies[key];
        const mockDeleteCookieFn = (context, key) =>
          delete context.cookies[key];

        const mockContext = {
          get: (key) => store[key],
          cookies,
          json: (data) => data,
          text: (data) => data,
        };

        const response = await handleWaiting(
          mockContext,
          () => {},
          mockGetCookieFn,
          mockDeleteCookieFn,
        );
        const expected = {
          action: STATES.ELIMINATED,
          data: "UPDATES",
          lastAction: undefined,
        };
        assertEquals(response, expected);
      });

      it("Passive handler should return updates along with current state and last action if the version id is not latest for waiting players in reinforce state", async () => {
        loadGameStateForTest(game, reinforce);
        const currentVersion = game.version;

        const store = {
          game,
        };

        const playerId = 1;
        const cookies = {
          "game-version": currentVersion - 1,
          playerId,
        };

        const mockGetCookieFn = (context, key) => context.cookies[key];
        const mockDeleteCookieFn = (context, key) =>
          delete context.cookies[key];
        const mockSetCookieFn = (
          context,
          key,
          value,
        ) => (context.cookies[key] = value);

        const mockContext = {
          get: (key) => store[key],
          cookies,
          json: (data) => data,
          text: (data) => data,
        };

        const response = await handleWaiting(
          mockContext,
          () => {},
          mockGetCookieFn,
          mockDeleteCookieFn,
          mockSetCookieFn,
        );

        const expectedData = game.getUpdates(currentVersion, playerId);

        const expected = {
          action: STATES.REINFORCE,
          data: expectedData,
          lastAction: {},
        };

        assertEquals(response, expected);
      });

      it("Passive handler should return updates along with current state and last action if the version id is not latest for waiting players in initial reinforcement state", async () => {
        loadGameStateForTest(game, initReinforceState);
        const currentVersion = game.version;

        const store = {
          game,
        };

        const playerId = 1;
        const cookies = {
          "game-version": currentVersion - 1,
          playerId,
        };

        const mockGetCookieFn = (context, key) => context.cookies[key];
        const mockDeleteCookieFn = (context, key) =>
          delete context.cookies[key];
        const mockSetCookieFn = (
          context,
          key,
          value,
        ) => (context.cookies[key] = value);

        const mockContext = {
          get: (key) => store[key],
          cookies,
          json: (data) => data,
          text: (data) => data,
        };

        const response = await handleWaiting(
          mockContext,
          () => {},
          mockGetCookieFn,
          mockDeleteCookieFn,
          mockSetCookieFn,
        );

        const expectedData = game.getUpdates(currentVersion, playerId);

        const expected = {
          action: STATES.INITIAL_REINFORCEMENT,
          data: expectedData,
          lastAction: {},
        };

        assertEquals(response, expected);
      });

      it("Passive handler should return updates along with current state and last action if the version id is not latest for waiting players in defend state", async () => {
        loadGameStateForTest(game, defendState);
        const currentVersion = game.version;

        const store = {
          game,
        };

        const playerId = 3;
        const cookies = {
          "game-version": currentVersion - 1,
          playerId,
        };

        const mockGetCookieFn = (context, key) => context.cookies[key];
        const mockDeleteCookieFn = (context, key) =>
          delete context.cookies[key];
        const mockSetCookieFn = (
          context,
          key,
          value,
        ) => (context.cookies[key] = value);

        const mockContext = {
          get: (key) => store[key],
          cookies,
          json: (data) => data,
          text: (data) => data,
        };

        const response = await handleWaiting(
          mockContext,
          () => {},
          mockGetCookieFn,
          mockDeleteCookieFn,
          mockSetCookieFn,
        );

        const expectedData = {
          ...game.getUpdates(currentVersion, playerId),
          invadeDetails: game.invadeDetail,
        };

        const expected = {
          action: STATES.DEFEND,
          data: expectedData,
          lastAction: {},
        };

        assertEquals(response, expected);
      });

      it("Passive handler should return updates along with current state and last action if the version id is not latest for active player", async () => {
        loadGameStateForTest(game, invasionState);
        const currentVersion = game.version;

        const store = {
          game,
        };

        const playerId = 1;
        const cookies = {
          "game-version": currentVersion - 1,
          playerId,
        };

        const mockGetCookieFn = (context, key) => context.cookies[key];
        const mockDeleteCookieFn = (context, key) =>
          delete context.cookies[key];
        const mockSetCookieFn = (
          context,
          key,
          value,
        ) => (context.cookies[key] = value);

        const mockContext = {
          get: (key) => store[key],
          cookies,
          json: (data) => data,
          text: (data) => data,
        };

        const response = await handleWaiting(
          mockContext,
          () => {},
          mockGetCookieFn,
          mockDeleteCookieFn,
          mockSetCookieFn,
        );

        const expectedData = game.getUpdates(currentVersion, playerId);

        const expected = {
          action: STATES.RESOLVE_COMBAT,
          data: expectedData,
          lastAction: {},
        };

        assertEquals(response, expected);
      });

      it("Passive handler should return updates along with current state and last action if the version id is not latest for passive waiting player", async () => {
        loadGameStateForTest(game, reinforce);
        const currentVersion = game.version;

        const store = {
          game,
        };

        const playerId = 3;
        const cookies = {
          "game-version": currentVersion - 1,
          playerId,
        };

        const mockGetCookieFn = (context, key) => context.cookies[key];
        const mockDeleteCookieFn = (context, key) =>
          delete context.cookies[key];
        const mockSetCookieFn = (
          context,
          key,
          value,
        ) => (context.cookies[key] = value);

        const mockContext = {
          get: (key) => store[key],
          cookies,
          json: (data) => data,
          text: (data) => data,
        };

        const response = await handleWaiting(
          mockContext,
          () => {},
          mockGetCookieFn,
          mockDeleteCookieFn,
          mockSetCookieFn,
        );

        const expectedData = game.getUpdates(currentVersion, playerId);

        const expected = {
          action: STATES.WAITING,
          data: expectedData,
          lastAction: {},
        };

        assertEquals(response, expected);
      });
    });

    describe.ignore("Same version id", () => {
      it("Handle waiting should send null when resolve fn not called the the timeout was cleared", async () => {
        loadGameStateForTest(game, reinforce);
        const currentVersion = game.version;

        const store = {
          game,
        };

        const playerId = 3;
        const cookies = {
          "game-version": currentVersion,
          playerId,
        };

        const mockGetCookieFn = (context, key) => context.cookies[key];
        const mockDeleteCookieFn = (context, key) =>
          delete context.cookies[key];
        const mockSetCookieFn = (
          context,
          key,
          value,
        ) => (context.cookies[key] = value);

        const mockContext = {
          get: (key) => store[key],
          cookies,
          json: (data) => data,
          text: (data) => data,
        };

        const mockTimeOut = 0;

        const response = handleWaiting(
          mockContext,
          () => {},
          mockGetCookieFn,
          mockDeleteCookieFn,
          mockSetCookieFn,
          mockTimeOut,
        );

        assertEquals(await response, null);
      });

      it("Handle waiting should send null when resolve fn is called but version ids are same", async () => {
        loadGameStateForTest(game, reinforce);
        const currentVersion = game.version;

        const store = {
          game,
        };

        const playerId = 3;
        const cookies = {
          "game-version": currentVersion,
          playerId,
        };

        const mockGetCookieFn = (context, key) => context.cookies[key];
        const mockDeleteCookieFn = (context, key) =>
          delete context.cookies[key];
        const mockSetCookieFn = (
          context,
          key,
          value,
        ) => (context.cookies[key] = value);

        const mockContext = {
          get: (key) => store[key],
          cookies,
          json: (data) => data,
          text: (data) => data,
        };

        const mockTimeOut = 0;

        const response = handleWaiting(
          mockContext,
          () => {},
          mockGetCookieFn,
          mockDeleteCookieFn,
          mockSetCookieFn,
          mockTimeOut,
        );

        const player = game.players.find((player) => player.id === playerId);

        player.resolve();
        assertEquals(await response, null);
      });

      (it.ignore(
        "Handle waiting should send null when resolve fn is called and version ids are not same",
        async () => {
          loadGameStateForTest(game, reinforce);
          const currentVersion = game.version;

          const store = {
            game,
          };

          const playerId = 3;
          const cookies = {
            "game-version": currentVersion,
            playerId,
          };

          const mockGetCookieFn = (context, key) => context.cookies[key];
          const mockDeleteCookieFn = (context, key) =>
            delete context.cookies[key];
          const mockSetCookieFn = (
            context,
            key,
            value,
          ) => (context.cookies[key] = value);

          const mockContext = {
            get: (key) => store[key],
            cookies,
            json: (data) => data,
            text: (data) => data,
          };

          const response = handleWaiting(
            mockContext,
            () => {},
            mockGetCookieFn,
            mockDeleteCookieFn,
            mockSetCookieFn,
          );

          game.updateGame("update", {}, playerId);
          broadCastNewUpdates(game.players);
          const { action, data } = await response;

          assertEquals(action, STATES.WAITING);
          assertEquals(data, game.getUpdates(currentVersion, playerId));
        },
      ),
        it("get /get-lobby-data should get the lobbby data and should start game ", async () => {
          const lobbies = new Map();
          lobbies.set(1, {
            id: 1,
            players: [{ name: "alex", id: 1 }, { name: "alice", id: 2 }, {
              name: "resso",
              id: 3,
            }],
            status: "in-game",
            roomType: "public",
            host: 1,
          });
          const app = createApp({}, false, [], lobbies);
          const res = await app.request("/get-lobby-data", {
            headers: { cookie: "lobbyId=1" },
          });

          assertEquals(res.status, 200);
          const data = await res.json();

          const expected = {
            playerDetails: [
              { name: "alex", isHost: true, id: 1 },
              { name: "alice", isHost: false, id: 2 },
              {
                name: "resso",
                isHost: false,
                id: 3,
              },
            ],
            data: {
              id: 1,
              players: [{ name: "alex" }, { name: "alice" }, { name: "resso" }],
              status: "in-game",
              roomType: "public",
            },
            isHost: false,
          };
          assertEquals(data.playerDetails, expected.playerDetails);
          assertEquals(data.isHost, expected.isHost);
        }));
    });
  });

  describe.ignore("Lobby testing", () => {
    it("get /get-lobby-data should get the lobbby data and should start game ", async () => {
      const lobbies = new Map();
      lobbies.set(1, {
        id: 1,
        players: [{ name: "alex" }, { name: "alice" }, { name: "resso" }],
        status: "game-started",
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
          {
            name: "resso",
          },
        ],
        data: {
          id: 1,
          players: [{ name: "alex" }, { name: "alice" }, { name: "resso" }],
          status: "game-started",
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

    it("/leave lobby should pop the player from lobby, delete the cookies and return the success status", async () => {
      const players = { 1: "alex", 2: "lisa" };
      const lobbies = new Map();
      lobbies.set(1, {
        id: 1,
        players: [{ id: 3 }, { id: 1 }, { id: 2 }],
        status: "in-game",
        roomType: "private",
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

    it("should create the lobby and set thee player as host ", async () => {
      const lobbies = new Map();
      const counter = { value: 1 };
      const app = createApp({}, "", { 1: "alex" }, lobbies, { counter });
      const res = await app.request("/create-room", {
        method: "post",
        headers: {
          cookie: "playerId=1",
        },
      });

      assertEquals(res.status, 302);
      assertEquals(res.headers.get("location"), "/lobby.html");
    });

    it("should setthe game id and game status to game started  if lobby status is not waiting ", async () => {
      const lobbies = new Map();
      const gamesRepo = new Map();
      lobbies.set(1, {
        id: 1,
        status: "",
        players: [],
      });
      const app = createApp(gamesRepo, false, {}, lobbies);
      const res = await app.request("/start-game", {
        headers: {
          cookie: "lobbyId=1",
        },
      });

      assertEquals(res.status, 200);
      const { ok } = await res.json();
      assert(ok);
    });

    it("should not  setthe game id and game status to game started  if lobby status is waiting ", async () => {
      const lobbies = new Map();
      const gamesRepo = new Map();
      lobbies.set(1, {
        id: 1,
        status: "waiting",
        players: [],
      });
      const app = createApp(gamesRepo, false, {}, lobbies);
      const res = await app.request("/start-game", {
        headers: {
          cookie: "lobbyId=1",
        },
      });

      assertEquals(res.status, 200);
      const { ok } = await res.json();
      assertFalse(ok);
    });

    it("should not join the room not available  ", async () => {
      const lobbies = new Map();
      const gamesRepo = new Map();
      lobbies.set(1, {
        id: 1,
        status: "waiting",
        players: [],
      });
      const app = createApp(gamesRepo, false, {}, lobbies);
      const res = await app.request("/join-room", {
        method: "post",
        body: JSON.stringify({ roomId: 2 }),
        headers: {},
      });
      assertEquals(res.status, 200);
      const { success } = await res.json();
      assertFalse(success);
    });

    it("should join the room if not filled  ", async () => {
      const lobbies = new Map();
      const gamesRepo = new Map();
      lobbies.set(1, {
        id: 1,
        status: "waiting",
        players: [],
      });
      const app = createApp(gamesRepo, false, {}, lobbies);
      const res = await app.request("/join-room", {
        method: "post",
        body: JSON.stringify({ roomId: 1 }),
        headers: {
          cookie: "playerId=1",
        },
      });
      assertEquals(res.status, 200);
      assertStringIncludes(res.headers.get("set-cookie"), "lobbyId");
      const { success } = await res.json();
      assert(success);
    });

    it("should join the room if not filled  and should set lobby status to in game if player length = 3 ", async () => {
      const lobbies = new Map();
      const gamesRepo = new Map();
      lobbies.set(1, {
        id: 1,
        status: "waiting",
        players: [{}, {}],
      });
      const app = createApp(gamesRepo, false, {}, lobbies);
      const res = await app.request("/join-room", {
        method: "post",
        body: JSON.stringify({ roomId: 1 }),
        headers: {
          cookie: "playerId=1",
        },
      });
      const lobby = lobbies.get(1);
      assertEquals(lobby.status, "in-game");
      assertEquals(res.status, 200);
      assertStringIncludes(res.headers.get("set-cookie"), "lobbyId");
      const { success } = await res.json();
      assert(success);
    });
  });

  describe("Logout tests", () => {
    it("logout should delete cookies and redirect to login.html if valid user", () => {
      const cookies = {
        playerId: 1,
      };

      const mockDeleteCookieFn = (context, key) => delete context.cookies[key];

      const mockContext = {
        get: (key) => store[key],
        cookies,
        redirect: (location) => location,
      };

      assertEquals(
        logoutHandler(mockContext, () => {}, mockDeleteCookieFn),
        "/login.html",
      );
    });
  });
});
