import { beforeEach, describe, it } from "@std/testing/bdd";
import { getMoveInDataService } from "../../src/services/get_move_in_data.js";
import { STATES } from "../../src/config.js";
import { assertEquals } from "@std/assert/equals";

describe("GET MOVE IN DATA", () => {
  let game;
  const reqData = { data: "LAST UPDATE" };
  beforeEach(() => {
    game = {
      getGameState: () => STATES.MOVE_IN,
      lastUpdate: reqData,
    };
  });
  it("should return the last update and the current gameState", () => {
    const { action, data } = getMoveInDataService(game);
    assertEquals(action, STATES.MOVE_IN);
    assertEquals(data, reqData);
  });
});
