import { beforeEach, describe, it } from "@std/testing/bdd";
import { FortificationController } from "../../src/handlers/fortification_controller.js";
import { ContinentsHandler } from "../../src/models/continents_handler.js";
import { Cards } from "../../src/models/cards.js";
import { Cavalry } from "../../src/models/cavalry.js";
import { TerritoriesHandler } from "../../src/models/territoryHandler.js";
import { InitialReinforcementController } from "../../src/handlers/initialreinforcement_controller.js";
import { ReinforcementController } from "../../src/handlers/reinforcement_controller.js";
import { InvasionController } from "../../src/handlers/invasion_controller.js";
import { mockPlayers } from "../../src/mock_data.js";
import { Game } from "../../src/game.js";
import { CONFIG, STATES } from "../../src/config.js";
import { assertEquals } from "@std/assert/equals";
import trade from "../../data/states/trade.json" with {
  type: "json",
};
import { loadGameStateForTest } from "../utilities.js";
import { assertThrows } from "@std/assert/throws";

describe("Game Get a card", () => {
  let game;
  const utilities = { random: Math.random };
  const handlers = {
    fortificationHandler: new FortificationController(CONFIG.TERRITORIES),
    continentsHandler: new ContinentsHandler(),
    cardsHandler: new Cards(),
    cavalry: new Cavalry(),
    territoriesHandler: new TerritoriesHandler(CONFIG.TERRITORIES),
  };

  const controllers = {
    initialReinforcementController: new InitialReinforcementController(
      1,
      handlers.territoriesHandler,
    ),
    reinforcementController: new ReinforcementController(
      handlers.territoriesHandler,
      handlers.continentsHandler,
    ),
    invasionController: new InvasionController(
      handlers.territoriesHandler,
      utilities.random,
    ),
  };

  describe("Get a card ", () => {
    beforeEach(() => {
      game = new Game(mockPlayers(), handlers, controllers, utilities);
    });

    it("should not get a card on unsuccesful invasion and move the phase reinforcement", () => {
      loadGameStateForTest(game, trade);
      const res = game.getCard();
      assertEquals(res.action, STATES.REINFORCE);
      assertEquals(res.data.card, undefined);
    });

    it.ignore("should get a card on unsuccesful invasion and move the phase reinforcement", () => {
      loadGameStateForTest(game, trade);
      const res = gme.getCard();
      const typeOfCard = typeof res.data.card;
      assertEquals(res.action, STATES.REINFORCE);
      assertEquals(typeOfCard, "string");
    });
  });

  describe("trade card tests", () => {
    let game;
    beforeEach(() => {
      const handlers = {
        fortificationHandler: new FortificationController(CONFIG.TERRITORIES),
        continentsHandler: new ContinentsHandler(),
        cardsHandler: new Cards(),
        cavalry: new Cavalry(),
        territoriesHandler: new TerritoriesHandler(CONFIG.TERRITORIES),
      };

      const utilities = { random: Math.random };

      const controllers = {
        initialReinforcementController: new InitialReinforcementController(
          1,
          handlers.territoriesHandler,
        ),
        reinforcementController: new ReinforcementController(
          handlers.territoriesHandler,
          handlers.continentsHandler,
        ),
        invasionController: new InvasionController(
          handlers.territoriesHandler,
          utilities.random,
        ),
      };

      game = new Game(mockPlayers(), handlers, controllers, utilities);
      game.loadGameState(trade);
    });
    it("should trade the cards", () => {
      const cards = ["2", "2", "2"];
      const { troops, positions } = game.tradeCard(cards);
      assertEquals(troops, 7);
      assertEquals(positions, [4, 6, 8]);
    });
    it("should throw", () => {
      const cards = ["2", "2", "1"];
      assertThrows(() => game.tradeCard(cards));
    });
  });
});
