import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals, assertThrows } from "@std/assert";

import { invadeService } from "../../src/services/invade.js";
import { defendService } from "../../src/services/defend.js";

import { STATES } from "../../src/config.js";

import invasion from "../../data/tests/invasion copy.json" with {
  type: "json",
};

import winState from "../../data/tests/win.json" with { type: "json" };

import { loadGameStateForTest } from "../utilities.js";
import { resolveCombatService } from "../../src/services/resolve_combat.js";
import { createGame } from "../../src/create_game.js";

describe("Invasion test", () => {
  let game;

  beforeEach(() => {
    game = createGame();
    loadGameStateForTest(game, invasion);
  });
  describe("===> INVADE", () => {
    it("for Invalid attacker should throw error", () => {
      const invadeDetails = {
        attackerTerritoryId: 1,
        attackerTroops: 11,
        defenderTerritoryId: 1,
      };
      assertThrows(
        () => invadeService(game, invadeDetails),
        Error,
        "Invalid Attacker",
      );
    });

    it("should throw error for invalid troop count", () => {
      const invadeDetails = {
        attackerTerritoryId: 2,
        attackerTroops: 11,
        defenderTerritoryId: 1,
      };
      assertThrows(
        () => invadeService(game, invadeDetails),
        Error,
        "Invalid Attacker Troops Count",
      );
    });

    it("should throw error invalid defender territory when you give non neighbour", () => {
      const invadeDetails = {
        attackerTerritoryId: 2,
        attackerTroops: 1,
        defenderTerritoryId: 32,
      };
      assertThrows(
        () => invadeService(game, invadeDetails),
        Error,
        "Invalid Defender Territory",
      );
    });

    it("should throw error invalid defender territory when attacker attacks his territory", () => {
      const invadeDetails = {
        attackerTerritoryId: 2,
        attackerTroops: 1,
        defenderTerritoryId: 2,
      };
      assertThrows(
        () => invadeService(game, invadeDetails),
        Error,
        "Invalid Defender Territory",
      );
    });

    it("Should throw an error if the attacker attacks from other player territory", () => {
      const invadeDetails = {
        attackerTerritoryId: 1,
        attackerTroops: 1,
        defenderTerritoryId: 2,
      };
      assertThrows(
        () => invadeService(game, invadeDetails),
        Error,
        "Invalid Attacker",
      );
    });

    it("should give some data", () => {
      const invadeDetail = {
        attackerTerritoryId: 2,
        attackerTroops: 2,
        defenderTerritoryId: 1,
      };
      const expected = { data: {}, newState: STATES.WAITING };
      assertEquals(invadeService(game, invadeDetail), expected);
      assertEquals(game.getGameState(), STATES.DEFEND);
    });
  });
});

describe("===> DEFEND", () => {
  let game;
  beforeEach(() => {
    game = createGame();
    loadGameStateForTest(game, invasion);
    const invadeDetail = {
      attackerTerritoryId: 2,
      attackerTroops: 2,
      defenderTerritoryId: 1,
    };
    invadeService(game, invadeDetail);
  });
  it("Should throw an error if the troop count is invalid", () => {
    const defendData = { troopCount: 3 };
    assertThrows(
      () => defendService(game, defendData),
      Error,
      "Invalid Troop Count",
    );
  });

  it("should return new state and action", () => {
    const defendData = { troopCount: 1 };
    const defendResult = defendService(game, defendData);
    const expected = {
      action: "WAITING",
      data: {
        remainingTroopsCount: 0,
        hasCaptured: false,
        remainingTroops: 0,
        attackerTerritoryId: 2,
        attackerTroops: 2,
        defenderTerritoryId: 1,
        defenderId: 3,
        defenderTroopCount: 1,
      },
    };
    assertEquals(defendResult.action, STATES.WAITING);
    assertEquals(
      defendResult.data.remainingTroopsCount,
      expected.data.remainingTroopsCount,
    );
    assertEquals(defendResult.data.defenderId, expected.data.defenderId);
    assertEquals(defendResult.data.defenderId, expected.data.defenderId);
    assertEquals(
      defendResult.data.attackerTroops,
      expected.data.attackerTroops,
    );
  });
});

describe("===> RESOLVE COMBAT", () => {
  let game;

  beforeEach(() => {
    game = createGame();
    loadGameStateForTest(game, invasion);
    const invadeDetail = {
      attackerTerritoryId: 2,
      attackerTroops: 2,
      defenderTerritoryId: 1,
    };
    invadeService(game, invadeDetail);
    const defendData = { troopCount: 1 };
    defendService(game, defendData);
  });

  it("should resolve the combat defender wins", () => {
    const actualResult = resolveCombatService(game, {}, 1, [], () => 0.3);
    assertEquals(actualResult.action, STATES.INVASION);
    assertEquals(actualResult.data.notifyMsg.status, "fail");
  });

  it("Should resolve the combat defender wins", () => {
    const random = (values = [0.1, 0.2, 0.3]) => {
      let i = 0;
      return () => {
        return values[i++ % values.length];
      };
    };
    const actualResult = resolveCombatService(game, {}, 1, [], random([0, 1]));
    assertEquals(actualResult.action, STATES.MOVE_IN);
    assertEquals(actualResult.data.notifyMsg.status, "success");
  });
});

describe("===> RESOLVE  COMBAT WIN STATE", () => {
  let game;

  beforeEach(() => {
    game = createGame();
    loadGameStateForTest(game, winState);
    const invadeDetail = {
      attackerTerritoryId: 26,
      attackerTroops: 3,
      defenderTerritoryId: 27,
    };
    invadeService(game, invadeDetail);
    const defendData = { troopCount: 2 };
    defendService(game, defendData);
  });

  it("Should eliminate the defender if he lost", () => {
    const random = (values = [0.1, 0.2, 0.3]) => {
      let i = 0;
      return () => {
        return values[i++ % values.length];
      };
    };
    const actualResult = resolveCombatService(
      game,
      {},
      1,
      [],
      random([1, 1, 1, 0, 0]),
    );
    assertEquals(actualResult.action, "WON");
    assertEquals(actualResult.data.notifyMsg.status, "success");
    assertEquals(actualResult.data.hasEliminated, true);
    assertEquals(actualResult.data.hasWon, true);
  });
});
