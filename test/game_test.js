import { describe, it } from "@std/testing/bdd";
import { Game } from "../src/game.js";
import { assert } from "@std/assert/assert";

describe("Game", () => {
  it("setup method should return data for the single user", () => {
    const game = new Game();
    const setupData = game.getSetup();
    const setupDataProperties = Object.keys(setupData);
    const expectedKeys = [
      "continents",
      "territories",
      "player",
      "opponents",
      "cards",
      "currentPlayer",
    ];

    expectedKeys.forEach((expectedKey) => {
      assert(setupDataProperties.some((key) => key === expectedKey));
    });
  });
});
