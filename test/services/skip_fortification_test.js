import { beforeEach, describe, it } from "@std/testing/bdd";
import { skipFortificationService } from "../../src/services/skip_fortification.js";
import { assertEquals } from "@std/assert/equals";
import { STATES } from "../../src/config.js";
import { assertThrows } from "@std/assert/throws";
import { ERROR_MESSAGE } from "../../src/config/error_message.js";

describe("Skip Fortification", () => {
  let game;
  let state;
  let updatedDetails;
  beforeEach(() => {
    state = STATES.FORTIFICATION;
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
    skipFortificationService(game);
    const newState = game.getGameState();
    assertEquals(newState, STATES.GET_CARD);
    assertEquals(updatedDetails, {
      state: STATES.SKIP_FORTIFICATION,
      data: {},
      playerId: 1,
    });
  });

  it("Should throw error when game state is not fortification", () => {
    game.setNewState(STATES.REINFORCE);
    const error = assertThrows(() => skipFortificationService(game));
    assertEquals(error.message, ERROR_MESSAGE.INVALID_ACTION);
  });
});
