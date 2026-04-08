import { beforeEach, describe, it } from "@std/testing/bdd";
import { FortificationController } from "../src/handlers/fortification_controller.js";

import fortification from "../data/states/fortification.json" with {
  type: "json",
};
import { assertEquals } from "@std/assert/equals";
import { assertThrows } from "@std/assert/throws";
import { TerritoriesHandler } from "../src/models/territoryHandler.js";
import { loadGameStateForTest } from "./utilities.js";
import { fortificationHandler } from "../src/models/fortification_handler.js";
import { Game } from "../src/game.js";
import { STATES } from "../src/config.js";

describe("FORTIFICATION ", () => {
  let fortificationController;
  const territoryHandler = new TerritoriesHandler(fortification.territories);
  const player = fortification.players.find(
    ({ id }) => fortification.activePlayerIndex === id - 1,
  );
  const playerTerritory = territoryHandler.getTerritoriesOf(player.id);

  describe("Fortification Controller", () => {
    beforeEach(() => {
      fortificationController = new FortificationController(
        fortification.territories,
      );
    });

    it("Should fortify when player try to fortify from one place to another", () => {
      const expectedData = [18, 19];
      const actualData = fortificationController.moveTroops(
        18,
        19,
        7,
        playerTerritory,
      );
      assertEquals(actualData, expectedData);
    });

    it("Should throw error when invalid territory is passed to move from", () => {
      assertThrows(() =>
        fortificationController.moveTroops(1, 19, 7, playerTerritory)
      );
    });

    it("Should throw error when invalid territory is passed to move to", () => {
      assertThrows(() =>
        fortificationController.moveTroops(18, 1, 7, playerTerritory)
      );
    });

    it("Should throw error when invalid troop count is passed", () => {
      assertThrows(() =>
        fortificationController.moveTroops(18, 19, 100, playerTerritory)
      );
    });
    it("Should throw error when territories are not connected", () => {
      assertThrows(() =>
        fortificationController.moveTroops(18, 28, 7, playerTerritory)
      );
    });
  });

  describe("FORTIFICATION HANDLER", () => {
    let game;
    beforeEach(() => {
      game = new Game();
    });

    it("Should return the new phase and updated territory when data is valid", () => {
      const expectedData = {
        updatedTerritories: [
          { territoryId: 18, troopCount: 1 },
          { territoryId: 19, troopCount: 8 },
        ],
      };

      loadGameStateForTest(game, fortification);

      const data = fortificationHandler(
        game,
        { from: 18, to: 19, count: 7 },
        1,
        game.players.slice(1),
      );

      assertEquals(data, { action: STATES.GET_CARD, data: expectedData });
    });

    it("Should not return the new phase and shouldn't updated territory when from territory is invalid", () => {
      const expectedData = [];
      loadGameStateForTest(game, fortification);
      const data = fortificationHandler(game, { from: 18, to: 1, count: 7 });
      assertEquals(data, { action: STATES.FORTIFICATION, data: expectedData });
    });

    it("Should not return the new phase and shouldn't updated territory when to territory is invalid", () => {
      const expectedData = [];
      loadGameStateForTest(game, fortification);
      const data = fortificationHandler(game, { from: 1, to: 19, count: 7 });
      assertEquals(data, { action: STATES.FORTIFICATION, data: expectedData });
    });

    it("Should not return the new phase and shouldn't updated territory when both territory id are same", () => {
      const expectedData = [];
      loadGameStateForTest(game, fortification);
      const data = fortificationHandler(game, { from: 22, to: 22, count: 9 });
      assertEquals(data, { action: STATES.FORTIFICATION, data: expectedData });
    });

    it("Should return the previous phase when called without fortification phase", () => {
      const expectedData = [];
      game;
      const data = fortificationHandler(game, { from: 22, to: 22, count: 9 });
      assertEquals(data, { action: STATES.SETUP, data: expectedData });
    });
  });
});
