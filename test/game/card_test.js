import { beforeEach, describe, it } from "@std/testing/bdd";
import { Game } from "../../src/game.js";
import { assertEquals } from "@std/assert/equals";
import get_card from "../../data/tests/get_card.json" with {
  type: "json",
};
import trade from "../../data/tests/trade.json" with {
  type: "json",
};
import { loadGameStateForTest } from "../utilities.js";
import { assertThrows } from "@std/assert/throws";

describe("Game Get a card", () => {
  let game;

  describe("Get a card ", () => {
    beforeEach(() => {
      game = new Game();
      loadGameStateForTest(game, get_card);
    });

    it("should get a card on succesful invasion and move the phase reinforcement", () => {
      const card = game.getCard();
      const typeOfCard = typeof card;
      assertEquals(typeOfCard, "string");
    });
  });

  describe("trade card tests", () => {
    let game;
    beforeEach(() => {
      game = new Game();
      loadGameStateForTest(game, trade);
    });
    it("should trade the cards", () => {
      const cards = ["2", "2", "2"];
      const { troops, positions } = game.tradeCard(cards);
      assertEquals(troops, 4);
      assertEquals(positions, [4, 6, 8]);
    });
    it("should throw", () => {
      const cards = ["2", "2", "1"];
      assertThrows(() => game.tradeCard(cards));
    });
  });
});
