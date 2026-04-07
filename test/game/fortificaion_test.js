import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import fortificationState from "../../data/states/fortification.json" with {
  type: "json",
};
import { Game } from "../../src/game.js";
import { loadGameStateForTest } from "../utilities.js";
import { STATES } from "../../src/config.js";
describe("fortification", () => {
  let game;
  beforeEach(() => {
    game = new Game();
  });

  it("Should update the troop from when move from place to another", () => {
    loadGameStateForTest(game, fortificationState);

    const from = 28;
    const to = 30;
    const count = 4;

    const expectedData = [
      {
        territoryId: 28,
        troopCount: 5,
      },
      {
        territoryId: 30,
        troopCount: 5,
      },
    ];

    const data = game.fortification(from, to, count);

    assertEquals(data, expectedData);
  });

  it("Should update update nothing when invalid troop count", () => {
    loadGameStateForTest(game, fortificationState);

    const from = 22;
    const to = 16;
    const count = 10;

    const expectedData = [];
    const data = game.fortification(from, to, count);
    assertEquals(data, expectedData);
  });
});

describe("skipFortification", () => {
  let game;
  beforeEach(() => {
    game = new Game();
  });

  it("Should return the ", () => {
    loadGameStateForTest(game, fortificationState);
    game.skipFortification();
    const state = game.getGameState();
    assertEquals(state, STATES.GET_CARD);
  });
});
