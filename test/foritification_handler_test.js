import { beforeEach, describe, it } from "@std/testing/bdd";
import { FortificationHandler } from "../src/models/fortification_handler.js";

import fortification from "../data/states/fortification.json" with {
  type: "json",
};
import { assertEquals } from "@std/assert/equals";
import { assertThrows } from "@std/assert/throws";

describe("Fortification handler", () => {
  let fortificationHandler;
  const player = fortification.players.find(({ id }) =>
    fortification.activePlayerId === id
  );

  beforeEach(() => {
    fortificationHandler = new FortificationHandler(fortification.territories);
  });

  it("Should reinforce when player can reinforece from one place to another", () => {
    const expectedData = [22, 16];
    const actualData = fortificationHandler.moveTroops(
      22,
      16,
      9,
      player.territories,
    );
    assertEquals(actualData, expectedData);
  });

  it("Should throw error when invalid territory is passed to move from", () => {
    assertThrows(() =>
      fortificationHandler.moveTroops(1, 16, 9, player.territories)
    );
  });

  it("Should throw error when invalid territory is passed to move to", () => {
    assertThrows(() =>
      fortificationHandler.moveTroops(22, 1, 9, player.territories)
    );
  });

  it("Should throw error when invalid troop count is passed", () => {
    assertThrows(() =>
      fortificationHandler.moveTroops(22, 16, 100, player.territories)
    );
  });

  // it("Should return the new phase and updated territory when data is valid", () => {
  //   const expectedData = [
  //     {
  //       territoryId: 22,
  //       troopCount: 1,
  //     },
  //     {
  //       territoryId: 16,
  //       troopCount: 10,
  //     },
  //   ];
  //   game.loadGameState(fortification);
  //   const data = fortificationHandler(game, { from: 22, to: 16, count: 9 });
  //   assertEquals(data, { action: STATES.GET_CARD, data: expectedData });
  // });

  // it("Should not return the new phase and shouldn't updated territory when from territory is invalid", () => {
  //   const expectedData = [];
  //   game.loadGameState(fortification);
  //   const data = fortificationHandler(game, { from: 1, to: 16, count: 9 });
  //   assertEquals(data, { action: STATES.FORTIFICATION, data: expectedData });
  // });

  // it("Should not return the new phase and shouldn't updated territory when to territory is invalid", () => {
  //   const expectedData = [];
  //   game.loadGameState(fortification);
  //   const data = fortificationHandler(game, { from: 22, to: 1, count: 9 });
  //   assertEquals(data, { action: STATES.FORTIFICATION, data: expectedData });
  // });

  // it("Should not return the new phase and shouldn't updated territory when both territory id are same", () => {
  //   const expectedData = [];
  //   game.loadGameState(fortification);
  //   const data = fortificationHandler(game, { from: 22, to: 22, count: 9 });
  //   assertEquals(data, { action: STATES.FORTIFICATION, data: expectedData });
  // });

  // it("Should return the previous phase when called without fortification phase", () => {
  //   const expectedData = [];
  //   game;
  //   const data = fortificationHandler(game, { from: 22, to: 22, count: 9 });
  //   assertEquals(data, { action: STATES.SETUP, data: expectedData });
  // });
});
