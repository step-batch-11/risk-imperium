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

describe("DEFEND", () => {
  it("should return next state and data", () => {
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

    const game = new Game(mockPlayers(), handlers, controllers, utilities);

    const savedState = defendState;
    const handler = {
      fortificationHandler: new FortificationController(
        defendState.territories,
      ),
    };
    game.loadGameState(savedState, handler);

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

    const game = new Game(mockPlayers(), handlers, controllers, utilities);
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

describe("CAPTURE", () => {
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
  });

  it("should return updated territory details ", () => {
    game.loadGameState(combatResolve);
    const result = game.captureTerritory(3);
    const expected = [{ territoryId: 21, troopCount: 2 }, {
      territoryId: 22,
      troopCount: 3,
    }];
    assertEquals(expected, result.data.updatedTerritories);
  });

  it("should eliminate the player if he doesn't have a territories ", () => {
    game.loadGameState(playerElimination);
    const result = game.captureTerritory(3);
    assertEquals(result.data.hasEliminated, true);
  });
});

describe("skipInvasion", () => {
  it("Should return the current state of the game", () => {
    game.loadGameState(invasionState);
    game.skipInvasion();
    const state = game.getGameState();
    assertEquals(state, STATES.FORTIFICATION);
  });
});

describe("GET OPPONENT CARDS", () => {
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
  });
  it("should get all cards owned by defender after elimination", () => {
    game.loadGameState(wonstate);
    const currentGameState = game.getSavableGameState();
    game.captureTerritory(3);
    assertEquals(currentGameState.players[0].cards.length, 2);
  });
});
