import { beforeEach, describe, it } from "@std/testing/bdd";

import {
  continuousNeighbour,
  fortificationService,
} from "../../src/services/fortification.js";
import { loadGameStateForTest } from "../utilities.js";
import fortificationState from "../../data/tests/fortification.json" with {
  type: "json",
};
import { assertEquals } from "@std/assert/equals";
import { STATES } from "../../src/config.js";
import { assertThrows } from "@std/assert/throws";
import { createGame } from "../../src/create_game.js";

describe("Fortification", () => {
  let game;
  beforeEach(() => {
    game = createGame();
    loadGameStateForTest(game, fortificationState);
  });

  describe("Service", () => {
    beforeEach(() => {
      game = createGame();
      loadGameStateForTest(game, fortificationState);
    });
    it("should update troops in territories when from, to and troop count provided", () => {
      const inputData = { to: 31, from: 32, count: 6 };

      const expectedData = {
        updatedTerritories: [
          {
            territoryId: 32,
            troopCount: 1,
          },
          {
            territoryId: 31,
            troopCount: 7,
          },
        ],
      };
      const response = fortificationService(game, inputData);
      const { action, data } = response;
      assertEquals(action, STATES.GET_CARD);
      assertEquals(data, expectedData);
    });

    it("should throw error when troop count is invalid", () => {
      const inputData = { to: 31, from: 32, count: 100 };
      assertThrows(() => fortificationService(game, inputData));
    });

    it("should throw error when from territory is invalid", () => {
      const inputData = { to: 42, from: 28, count: 1 };
      assertThrows(() => fortificationService(game, inputData));
    });

    it("should throw error when to territory is not connected", () => {
      const inputData = { to: 30, from: 32, count: 1 };
      assertThrows(() => fortificationService(game, inputData));
    });

    it("should throw error when both territory are same", () => {
      const inputData = { to: 32, from: 32, count: 1 };
      assertThrows(() => fortificationService(game, inputData));
    });
  });

  describe("Continuous Territory", () => {
    it("should return continuous territories", () => {
      const currentTerritory = fortificationState.territories[32];
      const set = continuousNeighbour(
        fortificationState.territories,
        currentTerritory,
        [1, 2, 31, 32, 35, 37, 39],
        [],
      );
      assertEquals(set, [1, 2, 32, 31]);
    });
  });
  describe("Game", () => {
    it("should throw error when called during any other phase", () => {
      game.setNewState(STATES.CAPTURE);
      assertThrows(() =>
        fortificationService(game, { from: 1, to: 2, count: 3 })
      );
    });
  });
});

//  if (!game.isCurrentUserTerritory(from)) {
//   72 |     throw ERROR_MESSAGE.INVALID_PARAMETERS;
//   73 |   }
