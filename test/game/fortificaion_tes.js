describe("fortification", () => {
  it("Should update the troop from when move from place to another", () => {
    const savedState = fortification;
    const handler = {
      fortificationHandler: new FortificationController(
        savedState.territories,
      ),
    };
    game.loadGameState(savedState, handler);

    const from = 22;
    const to = 16;
    const count = 9;

    const expectedData = [
      {
        territoryId: 22,
        troopCount: 1,
      },
      {
        territoryId: 16,
        troopCount: 10,
      },
    ];
    const data = game.fortification(from, to, count);

    assertEquals(data, expectedData);
  });
  it("Should update update nothing when invalid troop count", () => {
    game.loadGameState(fortification);

    const from = 22;
    const to = 16;
    const count = 10;

    const expectedData = [];
    const data = game.fortification(from, to, count);
    assertEquals(data, expectedData);
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
