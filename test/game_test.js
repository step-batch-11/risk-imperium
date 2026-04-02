import { beforeEach, describe, it } from "@std/testing/bdd";
import { Game } from "../src/game.js";
import { assert, assertEquals, assertThrows } from "@std/assert";
import { STATES } from "../src/config.js";
import invasionState from "../data/states/invasion.json" with { type: "json" };
import defendState from "../data/states/defend.json" with { type: "json" };
import reinforceState from "../data/states/reinforce.json" with {
  type: "json",
};
import initilaReinforcementState from "../data/states/init-reinforcement.json" with {
  type: "json",
};

describe("Game", () => {
  let game;
  beforeEach(() => {
    game = new Game();
  });

  it("setup method should return data for the single user", () => {
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

  describe("INIT TERRITORIES", () => {
    it("Init territories method should return the players and territories", () => {
      const { players, territories } = game.initTerritories();
      const setupData = game.getSetup();
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
      game.loadGameState(initilaReinforcementState);
    });

    it("reinforce method should return the updated troop count with the territory id", () => {
      const expectedTroopCount =
        initilaReinforcementState.territories[37].troopCount + 1;
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
        initilaReinforcementState.territories[37].troopCount;
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
        ...initilaReinforcementState,
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
      const game = new Game(() => 0.3);
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
      const game = new Game(() => 0.3);
      game.initTerritories();
      game.getSetup();
      const { action, data } = game.resolveCombat();
      const expected = {
        action: STATES.REINFORCE,
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
      game.getSetup();

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
    const game1 = new Game();
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
});
