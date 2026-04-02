import { beforeEach, describe, it } from "@std/testing/bdd";
import { Game } from "../src/game.js";
import { assert, assertEquals, assertThrows } from "@std/assert";
import { STATES } from "../src/config.js";
import invasionState from "../data/states/invasion.json" with { type: "json" };
import defendState from "../data/states/defend.json" with { type: "json" };
import getCardState from "../data/states/getCard.json" with { type: "json" };

import fortification from "../data/states/fortification.json" with {
  type: "json",
};
import combatResolve from "../data/states/resolve_combat.json" with {
  type: "json",
};
import reinforceState from "../data/states/reinforce.json" with {
  type: "json",
};
import initialReinforcementState from "../data/states/init-reinforcement.json" with {
  type: "json",
};
import playerElimination from "../data/states/player_elemination.json" with {
  type: "json",
};
import { ContinentsHandler } from "../src/models/continents_handler.js";
import { Cards } from "../src/models/cards.js";

describe("Game", () => {
  let game;
  let continentsHandler;
  beforeEach(() => {
    continentsHandler = new ContinentsHandler();
    game = new Game(continentsHandler);
  });

  it("setup method should return data for the single user", () => {
    const setupData = game.getSetup(1);
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

  describe("INIT TERRITORIES", () => {
    it("Init territories method should return the players and territories", () => {
      const { players, territories } = game.initTerritories();
      const setupData = game.getSetup(1);
      assertEquals(territories, setupData.territories);
      assertEquals(
        Object.values(territories).every(({ troopCount }) => troopCount === 1),
        true,
      );

      assertEquals(
        Object.values(players).every(
          ({ territories }) => territories.length === 7,
        ),
        true,
      );
    });
  });

  describe("SETUP INITIAL REINFORCEMENT PHASE", () => {
    it("Should set the initial remaining troops to deploy", () => {
      game.initTerritories();

      const { action, data } = game.setupNextPhase();

      assertEquals(action, STATES.INITIAL_REINFORCEMENT);
      assertEquals(data.troopsToReinforce, 13);
    });
  });

  describe("INITIAL REINFORCEMENT", () => {
    beforeEach(() => {
      game.loadGameState(initialReinforcementState);
    });

    it("reinforce method should return the updated troop count with the territory id", () => {
      const expectedTroopCount =
        initialReinforcementState.territories[37].troopCount + 1;
      const { action, data } = game.reinforce({
        territoryId: 37,
        troopCount: 1,
      });

      assertEquals(action, STATES.INITIAL_REINFORCEMENT);
      assertEquals(data.updatedTerritory.length, 1);
      const updatedTerritory = data.updatedTerritory[0];
      assertEquals(updatedTerritory.territoryId, 37);
      assertEquals(updatedTerritory.troopCount, expectedTroopCount);
    });

    it("reinforce method should not update the troop count is the troop count is invalid", () => {
      const expectedTroopCount =
        initialReinforcementState.territories[37].troopCount;
      const { action, data } = game.reinforce({
        territoryId: 37,
        troopCount: 3,
      });
      assertEquals(action, STATES.INITIAL_REINFORCEMENT);

      assertEquals(data.updatedTerritory.length, 1);
      const updatedTerritory = data.updatedTerritory[0];
      assertEquals(updatedTerritory.territoryId, 37);
      assertEquals(updatedTerritory.troopCount, expectedTroopCount);
    });

    it("reinforce method should change the game state when all troops are deployed", () => {
      const mockGameState = {
        ...initialReinforcementState,
        stateDetails: {
          initialTroopLimit: 13,
          remainingTroopsToDeploy: 1,
        },
      };
      game.loadGameState(mockGameState);

      const expectedTroopCount = mockGameState.territories[37].troopCount + 1;

      const { action, data } = game.reinforce({
        territoryId: 37,
        troopCount: 1,
      });

      const updatedTerritory = data.updatedTerritory[0];

      assertEquals(action, STATES.REINFORCE);
      assertEquals(updatedTerritory.territoryId, 37);
      assertEquals(updatedTerritory.troopCount, expectedTroopCount);
    });
  });

  describe("DEFEND", () => {
    it("should return next state and data", () => {
      const game = new Game(continentsHandler, () => 0.3);
      game.loadGameState(defendState);
      const defendData = { territoryId: "22", troopCount: 1 };
      const { action, data } = game.defend(defendData);
      const { stateDetails } = game.getSavableGameState();

      assertEquals(action, STATES.RESOLVE_COMBAT);
      assertEquals(data.attackerTroops, stateDetails.attackerTroops);
      assertEquals(data.defenderTroops, stateDetails.defenderTroops);
      assertEquals(data.defenderTerritoryId, stateDetails.defenderTerritoryId);
      assertEquals(data.attackerTerritoryId, stateDetails.attackerTerritoryId);
    });
  });

  describe("COMBAT_RESOLVE", () => {
    it("should return dice roll, new state, combat info, combat msg", () => {
      const game = new Game(continentsHandler, "cards", () => 0.3);
      game.initTerritories();
      game.getSetup(1);
      const { action, data } = game.resolveCombat();
      const expected = {
        action: STATES.INVASION,
        data: {
          attackerDice: [2, 2, 2],
          defenderDice: [2],
          msg: "Attack successful",
          updatedTerritories: [
            { territoryId: "21", troopCount: 0 },
            { territoryId: "22", troopCount: 1 },
          ],
        },
      };
      assertEquals(action, expected.action);
      assertEquals(data.attackerTroops, expected.data.attackerTroops);
      assertEquals(data.defenderTroops, expected.data.defenderTroops);
      assertEquals(data.defenderTerritoryId, expected.data.defenderTerritoryId);
      assertEquals(data.attackerTerritoryId, expected.data.attackerTerritoryId);
    });
  });

  describe("SET REINFORCEMENTS", () => {
    it("Should set and give the reinforcement ", () => {
      game.initTerritories();
      game.getSetup(1);

      for (let i = 1; i <= 13; i++) {
        game.reinforce({ territoryId: 37, troopCount: 1 });
      }

      const { action, data } = game.setupNextPhase();

      assertEquals(action, STATES.REINFORCE);
      assertEquals(data.troopsToReinforce, 3);
    });
  });

  describe("REINFORCE", () => {
    beforeEach(() => {
      game.loadGameState(reinforceState);
    });

    it("Should update the troop count and change the state if troops are fully deployed", () => {
      const { action, data } = game.reinforce({
        territoryId: 37,
        troopCount: 3,
      });

      const currentState = game.getSavableGameState();

      assertEquals(action, STATES.INVASION);
      assertEquals(data.updatedTerritory.length, 1);
      const updatedTerritory = data.updatedTerritory[0];
      assertEquals(
        updatedTerritory.troopCount,
        currentState.territories[37].troopCount,
      );
      assertEquals(data.remainingTroops, 0);
    });

    it("Should update the troop only", () => {
      const { action, data } = game.reinforce({
        territoryId: 37,
        troopCount: 1,
      });

      assertEquals(action, STATES.REINFORCE);

      assertEquals(data.updatedTerritory.length, 1);
      const updatedTerritory = data.updatedTerritory[0];
      assertEquals(updatedTerritory.troopCount, 3);
      assertEquals(data.remainingTroops, 0);
    });

    it("Shouldn't change any if the count is not valid", () => {
      const remainingTroopsToDeploy =
        reinforceState.stateDetails.remainingTroopsToDeploy;

      const { action, data } = game.reinforce({
        territoryId: 37,
        troopCount: 0,
      });

      assertEquals(action, STATES.REINFORCE);

      assertEquals(data.updatedTerritory.length, 1);
      const updatedTerritory = data.updatedTerritory[0];
      assertEquals(updatedTerritory.troopCount, 3);
      assertEquals(data.remainingTroops, remainingTroopsToDeploy);
    });
  });

  describe("GETSAVABLEGAMESTATE", () => {
    it("Should return new game state when game is just initialize", () => {
      const gameState = game.getSavableGameState();
      const expectedParameters = [
        "activePlayerId",
        "territories",
        "players",
        "continents",
        "state",
        "stateDetails",
      ];

      const parameters = Object.keys(gameState);
      assertEquals(expectedParameters.length, parameters.length);
      assert(parameters.every((param) => expectedParameters.includes(param)));
      assertEquals(gameState.state, STATES.SETUP);
    });

    it("Should return updated game state when game is initialize and troop initialization action is already done", () => {
      game.initTerritories();
      const gameState = game.getSavableGameState();
      const expectedParameters = [
        "activePlayerId",
        "territories",
        "players",
        "continents",
        "state",
        "stateDetails",
      ];
      const parameters = Object.keys(gameState);
      assertEquals(expectedParameters.length, parameters.length);
      assert(parameters.every((param) => expectedParameters.includes(param)));
      assertEquals(gameState.state, STATES.INITIAL_REINFORCEMENT);
    });
  });

  describe("LOADGAMESTATE", () => {
    const continentsHandler = new ContinentsHandler();
    const game1 = new Game(continentsHandler);
    game1.initTerritories();
    const initializedGameState = game1.getSavableGameState();
    it("Should reset the gameState when loaded with initialGameState", () => {
      const initialGameState = game.getSavableGameState();
      game.initTerritories();
      game.loadGameState(initialGameState);
      const loadedGameState = game.getSavableGameState();
      assertEquals(loadedGameState.state, STATES.SETUP);
    });

    it("Should load the initialized game state when loaded with initializedGameState", () => {
      game.loadGameState(initializedGameState);
      const loadedGameState = game.getSavableGameState();
      assertEquals(loadedGameState.state, STATES.INITIAL_REINFORCEMENT);
    });
  });

  describe("Invade", () => {
    beforeEach(() => {
      const gameState = invasionState;
      game.loadGameState(gameState);
    });

    it("invade should throw if troop count is invalid", () => {
      const invadeDetails = {
        attackerTerritoryId: 36,
        defenderTerritoryId: 37,
        attackingTroops: 6,
      };

      assertThrows(() => game.invade(invadeDetails));
    });

    it("invade should should change state to defend after attacking", () => {
      const invadeDetails = {
        attackerTerritoryId: 36,
        defenderTerritoryId: 37,
        attackerTroops: 3,
      };
      game.invade(invadeDetails);

      const currentState = game.getSavableGameState();
      assertEquals(currentState.state, STATES.DEFEND);
    });

    it("invade should throw if troop count is negative", () => {
      const invadeDetails = {
        attackerTerritoryId: 36,
        defenderTerritoryId: 37,
        attackingTroops: -1,
      };

      assertThrows(() => game.invade(invadeDetails));
    });

    it("invade should throw if attacker is invalid", () => {
      const invadeDetails = {
        attackerTerritoryId: 1,
        defenderTerritoryId: 2,
        attackingTroops: 2,
      };

      assertThrows(() => game.invade(invadeDetails));
    });
  });

  describe("getGameState", () => {
    it("Should return the current state of the game", () => {
      const state = game.getGameState();
      assertEquals(state, STATES.SETUP);
    });
  });
  describe("skipFortification", () => {
    it("Should return the ", () => {
      game.loadGameState(fortification);
      game.skipFortification();
      const state = game.getGameState();
      assertEquals(state, STATES.GET_CARD);
    });
  });

  describe("CAPTURE", () => {
    let game;
    beforeEach(() => {
      const continentsHandler = new ContinentsHandler();
      game = new Game(continentsHandler, () => 0.3);
    });
    it("should return updated territory details ", () => {
      game.loadGameState(combatResolve);
      const result = game.captureTerritory(3);
      const expected = [
        { territoryId: 21, troopCount: 2 },
        { territoryId: 22, troopCount: 3 },
      ];
      assertEquals(expected, result);
    });
  });
  it("should eliminate the player if he doesn't have a territories ", () => {
    game.loadGameState(playerElimination);
    const result = game.captureTerritory(3);
    const expected = [
      { territoryId: 1, troopCount: 27 },
      { territoryId: 2, troopCount: 3 },
    ];
    const currentState = game.getSavableGameState();
    assertEquals(expected, result);
    assertEquals(currentState.players.length, 5);
  });

  describe("skipInvasion", () => {
    it("Should return the current state of the game", () => {
      game.loadGameState(invasionState);
      game.skipInvasion();
      const state = game.getGameState();
      assertEquals(state, STATES.FORTIFICATION);
    });
  });

  describe("Get a card ", () => {
    it("should not get a card on unsuccesful invasion and move the phase reinforcement", () => {
      game.loadGameState(getCardState);
      const res = game.getCard();
      assertEquals(res.action, STATES.REINFORCE);
      assertEquals(res.data.card, undefined);
    });
    it("should get a card on unsuccesful invasion and move the phase reinforcement", () => {
      getCardState.stateDetails.hasCaptured = true;
      const cards = new Cards();
      const continent = new ContinentsHandler();
      const gme = new Game(continent, cards);
      gme.loadGameState(getCardState);
      const res = gme.getCard();
      const typeOfCard = typeof res.data.card;
      assertEquals(res.action, STATES.REINFORCE);
      assertEquals(typeOfCard, "string");
    });
  });
});
