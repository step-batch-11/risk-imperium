import { describe, it } from "@std/testing/bdd";
import { assert, assertEquals, assertFalse } from "@std/assert";
import {
  redirectInGamePlayer,
  redirectLoggedInPlayer,
  rejectIfNotInGame,
  rejectUnknownUser,
  setGame,
} from "../src/middle_ware.js";

describe("MIDDLE WARE TESTS", () => {
  describe("setGame tests", () => {
    it("setGame should set the game to the context", async () => {
      const gamesRepo = {
        get: () => "game",
      };
      const mockCookies = {
        "gameId": 1,
        "playerId": 1,
      };
      const mockCookieFn = (_, key) => {
        return mockCookies[key];
      };

      const mockContext = new Map();
      mockContext.set("gamesRepo", gamesRepo);
      await setGame(mockContext, () => {}, mockCookieFn);
      assertEquals(mockContext.get("game"), "game");
      assertEquals(mockContext.get("playerId"), 1);
    });
  });

  describe("redirect logged in player ", () => {
    it("Should redirect to home", () => {
      const mockCookies = {
        "playerId": 1,
      };
      const mockContextdata = {
        "players": { 1: "player1" },
      };
      const mockCookieFn = (mockContext, key) => {
        return mockContext.cookies[key];
      };

      let redirectedLocation;

      const mockContext = {
        get: (key) => mockContextdata[key],
        cookies: mockCookies,
        redirect: (location) => redirectedLocation = location,
      };

      let isNextCalled = false;
      const mockNext = () => isNextCalled = true;

      redirectLoggedInPlayer(mockContext, mockNext, mockCookieFn);
      assertEquals(redirectedLocation, "/");
      assertFalse(isNextCalled);
    });

    it("Should not redirect to home instead next should be called if no player id in cookie", () => {
      const mockCookies = {};
      const mockContextdata = {
        "players": { 1: "player1" },
      };
      const mockCookieFn = (mockContext, key) => {
        return mockContext.cookies[key];
      };

      const mockContext = {
        get: (key) => mockContextdata[key],
        cookies: mockCookies,
      };

      let isNextCalled = false;
      const mockNext = () => isNextCalled = true;

      redirectLoggedInPlayer(mockContext, mockNext, mockCookieFn);
      assert(isNextCalled);
    });
    it("Should not redirect to home instead next should be called if invalid player id ", () => {
      const mockCookies = {
        "playerId": 2,
      };
      const mockContextdata = {
        "players": { 1: "player1" },
      };
      const mockCookieFn = (mockContext, key) => {
        return mockContext.cookies[key];
      };

      const mockContext = {
        get: (key) => mockContextdata[key],
        cookies: mockCookies,
      };

      let isNextCalled = false;
      const mockNext = () => isNextCalled = true;

      redirectLoggedInPlayer(mockContext, mockNext, mockCookieFn);
      assert(isNextCalled);
    });
  });

  describe("reject unknown User", () => {
    it("Should redirect to login if no player id ", () => {
      const mockCookies = {};
      const mockContextdata = {
        "players": { 1: "player1" },
      };
      const mockCookieFn = (mockContext, key) => {
        return mockContext.cookies[key];
      };

      let redirectedLocation;

      const mockContext = {
        get: (key) => mockContextdata[key],
        cookies: mockCookies,
        redirect: (location) => redirectedLocation = location,
      };

      let isNextCalled = false;
      const mockNext = () => isNextCalled = true;

      rejectUnknownUser(mockContext, mockNext, mockCookieFn);
      assertEquals(redirectedLocation, "/login.html");
      assertFalse(isNextCalled);
    });
    it("Should not redirect to login page if invalid player id ", () => {
      const mockCookies = {
        "playerId": 2,
      };
      const mockContextdata = {
        "players": { 1: "player1" },
      };
      const mockCookieFn = (mockContext, key) => {
        return mockContext.cookies[key];
      };
      let redirectedLocation;

      const mockContext = {
        get: (key) => mockContextdata[key],
        cookies: mockCookies,
        redirect: (location) => redirectedLocation = location,
      };

      let isNextCalled = false;
      const mockNext = () => isNextCalled = true;

      rejectUnknownUser(mockContext, mockNext, mockCookieFn);
      assertEquals(redirectedLocation, "/login.html");
      assertFalse(isNextCalled);
    });
    it("Should not redirect to login instead next should be called if valid player id ", () => {
      const mockCookies = {
        "playerId": 1,
      };
      const mockContextdata = {
        "players": { 1: "player1" },
      };
      const mockCookieFn = (mockContext, key) => {
        return mockContext.cookies[key];
      };

      const mockContext = {
        get: (key) => mockContextdata[key],
        cookies: mockCookies,
      };

      let isNextCalled = false;
      const mockNext = () => isNextCalled = true;

      rejectUnknownUser(mockContext, mockNext, mockCookieFn);
      assert(isNextCalled);
    });
  });

  describe("redirect In Game Player", () => {
    it("Should redirect to game if valid player ", () => {
      const mockCookies = {
        gameId: 1,
      };
      const mockContextdata = {
        "players": { 1: "player1" },
        "gamesRepo": {
          has: () => true,
        },
      };
      const mockCookieFn = (mockContext, key) => {
        return mockContext.cookies[key];
      };

      let redirectedLocation;

      const mockContext = {
        get: (key) => mockContextdata[key],
        cookies: mockCookies,
        redirect: (location) => redirectedLocation = location,
      };

      let isNextCalled = false;
      const mockNext = () => isNextCalled = true;

      redirectInGamePlayer(mockContext, mockNext, mockCookieFn);
      assertEquals(redirectedLocation, "/game.html");
      assertFalse(isNextCalled);
    });
    it("Should call next when no valid game is proivded  ", () => {
      const mockCookies = {
        gameId: 1,
      };
      const mockContextdata = {
        "players": { 1: "player1" },
        "gamesRepo": {
          has: () => false,
        },
      };
      const mockCookieFn = (mockContext, key) => {
        return mockContext.cookies[key];
      };

      const mockContext = {
        get: (key) => mockContextdata[key],
        cookies: mockCookies,
      };

      let isNextCalled = false;
      const mockNext = () => isNextCalled = true;

      redirectInGamePlayer(mockContext, mockNext, mockCookieFn);
      assert(isNextCalled);
    });
  });

  describe("redirect If player not in game", () => {
    it("Should redirect to home if not valid game  ", () => {
      const mockCookies = {
        gameId: 1,
      };
      const mockContextdata = {
        "players": { 1: "player1" },
        "gamesRepo": {
          has: () => false,
        },
      };
      const mockCookieFn = (mockContext, key) => {
        return mockContext.cookies[key];
      };

      let redirectedLocation;

      const mockContext = {
        get: (key) => mockContextdata[key],
        cookies: mockCookies,
        redirect: (location) => redirectedLocation = location,
      };

      let isNextCalled = false;
      const mockNext = () => isNextCalled = true;

      rejectIfNotInGame(mockContext, mockNext, mockCookieFn);
      assertEquals(redirectedLocation, "/");
      assertFalse(isNextCalled);
    });
    it("Should call next when  valid game is proivded  ", () => {
      const mockCookies = {
        gameId: 1,
      };
      const mockContextdata = {
        "players": { 1: "player1" },
        "gamesRepo": {
          has: () => true,
        },
      };
      const mockCookieFn = (mockContext, key) => {
        return mockContext.cookies[key];
      };

      const mockContext = {
        get: (key) => mockContextdata[key],
        cookies: mockCookies,
      };

      let isNextCalled = false;
      const mockNext = () => isNextCalled = true;

      rejectIfNotInGame(mockContext, mockNext, mockCookieFn);
      assert(isNextCalled);
    });
  });
});
