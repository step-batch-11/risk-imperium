import { beforeEach, describe, it } from "@std/testing/bdd";
import { Game } from "../../src/game.js";
import { assertEquals } from "@std/assert/equals";
import { STATES } from "../../src/config.js";

import initialReinforcementState from "../../data/tests/init_reinforce.json" with {
  type: "json",
};
import initialReinforcementLastTroopState from "../../data/tests/lastTroop.json" with {
  type: "json",
};
import { loadGameStateForTest } from "../utilities.js";

let game;
describe("INITIAL REINFORCEMENT", () => {
  beforeEach(() => {
    game = new Game();
    loadGameStateForTest(game, initialReinforcementState);
  });

  it("reinforce method should return the updated troop count with the territory id", () => {
    const expectedTroopCount =
      initialReinforcementState.territories[37].troopCount + 1;
    const { action, data } = game.reinforce({
      territoryId: 37,
      troopCount: 1,
    });

    assertEquals(action, STATES.INITIAL_REINFORCEMENT);
    assertEquals(data.updatedTerritory.length, 1);
    const updatedTerritory = data.updatedTerritory[0];
    assertEquals(updatedTerritory.territoryId, 37);
    assertEquals(updatedTerritory.troopCount, expectedTroopCount);
  });

  it("reinforce method should change the game state when all troops are deployed", () => {
    const savedState = initialReinforcementLastTroopState;
    loadGameStateForTest(game, savedState);

    Array.from(
      { length: 12 },
      () => game.reinforce({ territoryId: 28, troopCount: 1 }),
    );
    const { action, data } = game.reinforce({ territoryId: 28, troopCount: 1 });
    assertEquals(data.remainingTroops, 0);
    assertEquals(action, STATES.REINFORCE);
  });
});
