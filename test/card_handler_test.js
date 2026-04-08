import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import {
  getCardHandler,
  tradeCardHandler,
} from "../src/handlers/card_handler.js";
import { Player } from "../src/models/player_handler.js";
import { STATES } from "../src/config.js";

describe("card handler tests", () => {
  it("should return action and data", () => {
    const game = {
      tradeCard: () => 1,
      getGameState: () => 2,
      lastUpdate: {},
      isTurnOf: () => false,
    };
    const result = tradeCardHandler(game, "", 1, [new Player()]);
    const expected = { action: 2, data: 1 };
    assertEquals(result, expected);
  });
  it("should return action and card", () => {
    const game = {
      getCard: () => 1,
      getGameState: () => 2,
      canGetCard: true,
      isTurnOf: () => false,
      passToNextPlayer: () => {},
    };
    const result = getCardHandler(game, "", 1, [new Player()]);
    const expected = {
      action: STATES.WAITING,
      data: { card: 1, currentPlayerId: undefined },
    };
    assertEquals(result.action, expected.action);
    assertEquals(result.data.card, expected.data.card);
  });
});
