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
