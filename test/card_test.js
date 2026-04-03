import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
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
});
