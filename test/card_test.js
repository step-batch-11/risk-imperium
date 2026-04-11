import { beforeEach, describe, it } from "@std/testing/bdd";
import { assert, assertEquals } from "@std/assert";
import { Cards } from "../src/models/cards.js";

describe("card tests", () => {
  let cards;
  beforeEach(() => {
    cards = new Cards();
  });

  it("should return true for valid set", () => {
    const combo = ["1", "1", "1"];
    const result = cards.isValidCombination(combo);
    assertEquals(result, true);
  });
  it("should return false for invalid set", () => {
    const combo = ["1", "1", "2"];
    const result = cards.isValidCombination(combo);
    assertEquals(result, false);
  });
  it("should give a random card from the set", () => {
    assert(cards.drawCard());
  });
});
