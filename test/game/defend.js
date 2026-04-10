import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import { createGame } from "../../src/create_game.js";
import { loadGameStateForTest } from "../utilities.js";
import defendState from "../../data/tests/defend.json" with { type: "json" };

describe("Game Defend", () => {
  let game;
  beforeEach(() => {
    game = createGame();
  });

  describe("DEFEND", () => {
    it("should return next state and data", () => {
      loadGameStateForTest(game, defendState);

      const defendData = { territoryId: "22", troopCount: 1 };
      const { action, data } = game.defend(defendData);
      const { stateDetails } = game.getSavableGameState();

      assertEquals(action, STATES.RESOLVE_COMBAT);
      assertEquals(data.attackerTroops, stateDetails.attackerTroops);
      assertEquals(data.defenderTroops, stateDetails.defenderTroops);
      assertEquals(data.defenderTerritoryId, stateDetails.defenderTerritoryId);
      assertEquals(data.attackerTerritoryId, stateDetails.attackerTerritoryId);
    });
  });
});
