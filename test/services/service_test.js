import { beforeEach, describe, it } from "@std/testing/bdd";
import { createGame } from "../../src/create_game.js";
import { setupService } from "../../src/services/setup_service.js";
import { assertEquals } from "@std/assert/equals";
import { STATES } from "../../src/config.js";
import { loadGameStateForTest } from "../utilities.js";
import fortification from "../../data/tests/fortification.json" with {
  type: "json",
};
import reinforce_setup_no_troops from "../../data/tests/reinforce_setup_no_troops.json" with {
  type: "json",
};
import reinforce_setup_existing_troops from "../../data/tests/reinforce_setup_existing_troops.json" with {
  type: "json",
};

import { assertThrows } from "@std/assert/throws";
import { ERROR_MESSAGE } from "../../src/config/error_message.js";
describe("Setup Service", () => {
  let game;
  beforeEach(() => {
    game = createGame();
  });
  it("should return remaining troops with state as initialReinforcement when current game state is initial reinforce", () => {
    const { action, data } = setupService(game);
    assertEquals(action, STATES.INITIAL_REINFORCEMENT);
    assertEquals(data, { troopsToReinforce: 13 });
  });

  it("should return troop to reinforce if troops are not present", () => {
    loadGameStateForTest(game, reinforce_setup_no_troops);
    const { action, data } = setupService(game);
    assertEquals(action, STATES.REINFORCE);
    assertEquals(data, { troopsToReinforce: 3 });
  });

  it("should return troop to reinforce if troops are already present", () => {
    loadGameStateForTest(game, reinforce_setup_existing_troops);
    const { action, data } = setupService(game);
    assertEquals(action, STATES.REINFORCE);
    assertEquals(data, { troopsToReinforce: 1 });
  });

  it("should throw when neither Reinforce nor initial reinforce", () => {
    loadGameStateForTest(game, fortification);
    const error = assertThrows(() => setupService(game));
    assertThrows(error.message, ERROR_MESSAGE.INVALID_PARAMETERS);
  });
});
//  if (game.getGameState() === STATES.REINFORCE) {
//   15 |     const troopsToDeploy = getReinforcementCount(playerTerritory);
//   16 |     if (!(game.stateDetails.remainingTroopsCount)) {
//   17 |       game.addReinforcementTroops(troopsToDeploy);
//   18 |     }
// -----|-----
//   20 |     return {
//   21 |       action: game.getGameState(),
//   22 |       data: { troopsToReinforce: game.stateDetails.remainingTroopsCount },
//   23 |     };
//   24 |   }
