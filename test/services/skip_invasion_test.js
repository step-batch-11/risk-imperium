import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import { STATES } from "../../src/config.js";
import { assertThrows } from "@std/assert/throws";
import { ERROR_MESSAGE } from "../../src/config/error_message.js";
import { skipInvasionService } from "../../src/services/skip_invasion.js";

describe("Skip Invasion", () => {
  let game;
  let state;
  let updatedDetails;
  beforeEach(() => {
    state = STATES.INVASION;
    updatedDetails = {};
    game = {
      setNewState: (newState) => {
        state = newState;
      },
      updateGame: (state, data, playerId) => {
        updatedDetails = { state, data, playerId };
      },
      getGameState: () => {
        return state;
      },
      activePlayerId: 1,
    };
  });

  it("Should Skip Invasion when called", () => {
    skipInvasionService(game);
    const newState = game.getGameState();
    assertEquals(newState, STATES.FORTIFICATION);
    assertEquals(updatedDetails, {
      state: STATES.SKIP_INVASION,
      data: {},
      playerId: 1,
    });
  });

  it("Should throw error when game state is not Invasion", () => {
    game.setNewState(STATES.REINFORCE);
    const error = assertThrows(() => skipInvasionService(game));
    assertEquals(error.message, ERROR_MESSAGE.INVALID_ACTION);
  });
});
