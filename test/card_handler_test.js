import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import {
  getCardHandler,
  tradeCardHandler,
} from "../src/handlers/cardHandler.js";

describe("card handler tests", () => {
  it("should return action and data", () => {
    const game = {
      tradeCard: () => 1,
      getGameState: () => 2,
    };
    const result = tradeCardHandler(game, "");
    const expected = { action: 2, data: 1 };
    assertEquals(result, expected);
  });
  it("should return action and card", () => {
    const game = {
      getCard: () => 1,
      getGameState: () => 2,
      canGetCard: true,
    };
    const result = getCardHandler(game);
    const expected = { action: 2, data: { card: 1 } };
    assertEquals(result, expected);
  });
});
