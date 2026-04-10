import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals, assertThrows } from "@std/assert";
import moveIn from "../../data/tests/move_in.json" with {
  type: "json",
};

import { loadGameStateForTest } from "../utilities.js";
import { captureService } from "../../src/services/capture.js";
import { createGame } from "../../src/create_game.js";
import { STATES } from "../../src/config.js";

describe("===> RESOLVE COMBAT", () => {
  let game;
  beforeEach(() => {
    game = createGame();
    loadGameStateForTest(game, moveIn);
  });

  it("should throw an error if the troop count is more than troop in the territory", () => {
    assertThrows(() => captureService(game, 4), Error, "Invalid troop count");
  });

  it("should throw an error if the troop count is less than zero", () => {
    assertThrows(() => captureService(game, -1), Error, "Invalid troop count");
  });

  it("should move troops", () => {
    const actualResult = captureService(game, 2);
    assertEquals(actualResult.action, STATES.INVASION);
    assertEquals(actualResult.data.updatedTerritories, [
      { territoryId: 37, troopCount: 2 },
      { territoryId: 36, troopCount: 5 },
    ]);
  });
});
