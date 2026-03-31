import { assertEquals } from "@std/assert/equals";
import { handleGameSetup } from "../src/handler.js";
import { describe, it } from "@std/testing/bdd";
import { Game } from "../src/game.js";
import { assertRejects } from "@std/assert/rejects";
import { handleUserActions } from "../src/handlers/user_actions.js";

describe("Api Handler", () => {
  describe("handleGameSetup", () => {
    it("Should return the game setup data when called", () => {
      const setupData = { data: "this is the setup Data" };
      const store = {
        "game": {
          getSetup: () => setupData,
        },
      };
      const context = {
        get: (item) => store[item],
        json: (data) => data,
      };

      const actualSetupData = handleGameSetup(context);
      assertEquals(actualSetupData, setupData);
    });
  });

  describe("handleUserActions", () => {
    it("Should handle user actions when called", async () => {
      const game = new Game();
      game.initTerritories();
      const context = {
        get: () => game,
        req: {
          json: () => ({
            userActions: "REINFORCE",
            data: { territoryId: 37, troopCount: 1 },
          }),
        },
        json: (data) => data,
      };

      const { action, data } = await handleUserActions(context);

      assertEquals(action, "INITIAL_REINFORCEMENT");
      assertEquals(data.newTroopCount, 2);
      assertEquals(data.territoryId, 37);
    });

    it("Should throw an error when the arguments are not given", () => {
      assertRejects(() => handleUserActions());
    });
  });
});
