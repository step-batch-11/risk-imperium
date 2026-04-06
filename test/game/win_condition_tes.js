describe("WIN CONDITION", () => {
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

  it("game state should change to won", () => {
    game.loadGameState(playerWon);
    game.captureTerritory(3);
    const currentGameState = game.getSavableGameState();
    assertEquals(currentGameState.stateDetails.hasCaptured, true);
    assertEquals(currentGameState.stateDetails.hasWon, true);
  });
});
