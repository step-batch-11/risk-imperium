import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals, assertFalse, assertThrows } from "@std/assert";
import {
  getCardService,
  tradeCardService,
  validateCardCombination,
} from "../../src/services/card_service.js";
import { STATES } from "../../src/config.js";
import { createGame } from "../../src/create_game.js";
import { loadGameStateForTest } from "../utilities.js";

import tradeState from "../../data/tests/trade.json" with { type: "json" };
describe("CARD SERVICE TESTS", () => {
  describe("GET CARD SERVICE", () => {
    it("get card service should return the new state, card and current player id change the turn and the state of the game and reset has captured if has captured is true", () => {
      const game = {
        hasCaptured: true,
        getCard: () => 1,
        activePlayerId: 1,
        passToNextPlayer() {
          this.activePlayerId++;
        },
      };

      const { action, data } = getCardService(game);
      assertEquals(action, STATES.WAITING);
      assertEquals(data.card, 1);
      assertEquals(data.currentPlayerId, 2);
    });

    it("get card service should change the turn and the state of the game and reset has captured if has captured is false and card should be undefined", () => {
      const game = {
        hasCaptured: false,
        getCard: () => 1,
        activePlayerId: 1,
        passToNextPlayer() {
          this.activePlayerId++;
        },
      };

      const { action, data } = getCardService(game);
      assertEquals(action, STATES.WAITING);
      assertFalse(data.card);
      assertEquals(data.currentPlayerId, 2);
    });
  });

  describe("TRADE CARD SERVICE", () => {
    let game;
    beforeEach(() => {
      game = createGame();
      loadGameStateForTest(game, tradeState);
    });
    it("trade card service should throw if invalid cards", () => {
      const data = { cards: ["3", "3"] };
      const error = assertThrows(() => tradeCardService(game, data));
      assertEquals(error.message, "INVALID CARDS COMBO");
    });

    it("trade card should return the new state as action, and the   ", () => {
      const reqData = { cards: ["2", "2", "4"] };
      const { action, data } = tradeCardService(game, reqData);
      assertEquals(action, STATES.REINFORCE);
      const expectedData = { positions: [4, 6, 8], troops: 8 };

      assertEquals(data, expectedData);
    });
  });

  describe("VALID CARDS TESTS", () => {
    it("validateCardCombination should throw if invalid combination of cards", () => {
      const game = {
        isValidCombination: () => false,
        isPlayerCards: () => true,
      };

      assertThrows(() => validateCardCombination(game, [1, 2, 1]));
    });

    it("validateCardCombination should throw if  player doesn't have those cards", () => {
      const game = {
        isValidCombination: () => true,
        isPlayerCards: () => false,
      };

      assertThrows(() => validateCardCombination(game, [1, 2, 1]));
    });

    it("validateCardCombination should not throw if valid combination of cards and player have those cards", () => {
      const game = {
        isValidCombination: () => true,
        isPlayerCards: () => true,
      };

      assertEquals(validateCardCombination(game, [1, 2, 1]));
    });
  });
});
