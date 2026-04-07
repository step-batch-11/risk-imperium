import { beforeEach, describe, it } from "@std/testing/bdd";
import { FortificationController } from "../src/handlers/fortification_controller.js";

import fortification from "../data/tests/fortification.json" with {
  type: "json",
};
import { assertEquals } from "@std/assert/equals";
import { assertThrows } from "@std/assert/throws";
import { TerritoriesHandler } from "../src/models/territoryHandler.js";
import { loadGameStateForTest } from "./utilities.js";
import { fortificationHandler } from "../src/models/fortification_handler.js";
import { Game } from "../src/game.js";
import { STATES } from "../src/config.js";

describe("FORTIFICATION CONTROLLER ", () => {
  let fortificationController;
  const territoryHandler = new TerritoriesHandler(fortification.territories);
  const player = fortification.players.find(
    ({ id }) => fortification.activePlayerId === id,
  );
  const playerTerritory = territoryHandler.getTerritoriesOf(player.id);

  beforeEach(() => {
    fortificationController = new FortificationController(
      fortification.territories,
    );
  });

  it.ignore("Should reinforce when player can reinforece from one place to another", () => {
    const expectedData = [10, 26];
    const actualData = fortificationHandler.moveTroops(
      10,
      26,
      9,
      playerTerritory,
    );
    assertEquals(actualData, expectedData);
  });

  it("Should throw error when invalid territory is passed to move from", () => {
    assertThrows(() =>
      fortificationController.moveTroops(1, 16, 9, player.territories)
    );
  });

  it("Should throw error when invalid territory is passed to move to", () => {
    assertThrows(() =>
      fortificationController.moveTroops(22, 1, 9, player.territories)
    );
  });

  it("Should throw error when invalid troop count is passed", () => {
    assertThrows(() =>
      fortificationController.moveTroops(22, 16, 100, player.territories)
    );
  });

  describe("FORTIFICATION HANDLER", () => {
    let game;
    beforeEach(() => {
      game = new Game();
    });

    it("Should return the new phase and updated territory when data is valid", () => {
      const expectedData = [
        { territoryId: 28, troopCount: 5 },
        { territoryId: 30, troopCount: 5 },
      ];

      loadGameStateForTest(game, fortification);

      const data = fortificationHandler(
        game,
        { from: 28, to: 30, count: 4 },
        1,
        game.players.slice(1),
      );

      assertEquals(data, { action: STATES.GET_CARD, data: expectedData });
    });

    it("Should not return the new phase and shouldn't updated territory when from territory is invalid", () => {
      const expectedData = [];
      loadGameStateForTest(game, fortification);
      const data = fortificationHandler(game, { from: 1, to: 16, count: 9 });
      assertEquals(data, { action: STATES.FORTIFICATION, data: expectedData });
    });

    it("Should not return the new phase and shouldn't updated territory when to territory is invalid", () => {
      const expectedData = [];
      loadGameStateForTest(game, fortification);
      const data = fortificationHandler(game, { from: 22, to: 1, count: 9 });
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
