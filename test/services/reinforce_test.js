import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals, assertThrows } from "@std/assert";
import { createGame } from "../../src/create_game.js";
import { loadGameStateForTest } from "../utilities.js";
import { STATES } from "../../src/config.js";
import {
  initialReinforceService,
  reinforcementsServices,
  reinforceService,
} from "../../src/services/reinforcement.js";

import initReinforceState from "../../data/tests/init_reinforce.json" with {
  type: "json",
};
import reinforceState from "../../data/tests/reinforce2.json" with {
  type: "json",
};
import { ERROR_MESSAGE } from "../../src/config/error_message.js";

describe("REINFORCE TESTS", () => {
  describe("INIT-REINFORCEMENT", () => {
    let game;
    beforeEach(() => {
      game = createGame();
      loadGameStateForTest(game, structuredClone(initReinforceState));
    });

    it("Init reinforce should put one troop in the given territory and change the state to Waiting and return the updated territories", () => {
      const { action, data } = initialReinforceService(game, {
        territoryId: 1,
      });

      const expectedData = {
        currentPlayerId: 2,
        remainingTroops: 1,
        updatedTerritory: [{ territoryId: 1, troopCount: 2 }],
      };

      assertEquals(action, STATES.WAITING);
      assertEquals(data, expectedData);
    });
  });

  describe("REINFORCE SERVICE", () => {
    let game;
    beforeEach(() => {
      game = createGame();
      loadGameStateForTest(game, structuredClone(reinforceState));
    });

    it("reinforce service should throw on invalid troopCount", () => {
      const error = assertThrows(() =>
        reinforceService(game, { territoryId: 1, troopCount: 100 })
      );

      assertEquals(error.message, ERROR_MESSAGE.INVALID_PARAMETERS);
    });

    it("reinforce service should add troops to given territory and not change the state if troops left and return the new state as action and the updated territories, remaingTroopscount, current player id", () => {
      const remainingTroop = game.stateDetails.remainingTroopsCount;
      const territoryId = 1;
      const reqData = {
        territoryId,
        troopCount: remainingTroop - 1,
      };

      const { action, data } = reinforceService(game, reqData);
      const expectedData = {
        currentPlayerId: 1,
        remainingTroops: 1,
        updatedTerritory: [
          {
            territoryId,
            troopCount: 4,
          },
        ],
      };

      assertEquals(action, STATES.REINFORCE);
      assertEquals(data, expectedData);
    });

    it("reinforce service should add troops to given territory and change the state if no troops left and return the new state as action and the updated territories, remaingTroopscount, current player id", () => {
      const remainingTroop = game.stateDetails.remainingTroopsCount;
      const territoryId = 1;
      const reqData = {
        territoryId,
        troopCount: remainingTroop,
      };

      const { action, data } = reinforceService(game, reqData);
      const expectedData = {
        currentPlayerId: 1,
        remainingTroops: 0,
        updatedTerritory: [
          {
            territoryId,
            troopCount: 5,
          },
        ],
      };

      assertEquals(action, STATES.INVASION);
      assertEquals(data, expectedData);
    });
  });

  describe("REINFORMENTS SERVICES", () => {
    let game;
    beforeEach(() => {
      game = createGame();
    });

    it("reinforcementsServices should deleget to initialReinforceService if state is init-reinforce", () => {
      loadGameStateForTest(game, structuredClone(initReinforceState));
      const { action, data } = reinforcementsServices(game, {
        territoryId: 1,
      });

      const expectedData = {
        currentPlayerId: 2,
        remainingTroops: 1,
        updatedTerritory: [{ territoryId: 1, troopCount: 2 }],
      };

      assertEquals(action, STATES.WAITING);
      assertEquals(data, expectedData);
    });

    it("reinforcementsServices should deleget to reinforceService if state is reinforce", () => {
      loadGameStateForTest(game, structuredClone(reinforceState));
      const remainingTroop = game.stateDetails.remainingTroopsCount;
      const territoryId = 1;
      const reqData = {
        territoryId,
        troopCount: remainingTroop,
      };

      const { action, data } = reinforceService(game, reqData);
      const expectedData = {
        currentPlayerId: 1,
        remainingTroops: 0,
        updatedTerritory: [
          {
            territoryId,
            troopCount: 5,
          },
        ],
      };

      assertEquals(action, STATES.INVASION);
      assertEquals(data, expectedData);
    });

    it("reinforcementsServices should throw if state is not reinforce or init reinforce", () => {
      const game = {
        getGameState: () => "INVALID",
      };

      const error = assertThrows(() => reinforcementsServices(game, {}));
      assertEquals(error.message, ERROR_MESSAGE.INVALID_STATE);
    });
  });
});
