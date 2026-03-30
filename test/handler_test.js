import { assertEquals } from "@std/assert/equals";
import { handleGameSetup, handleInitTerritories } from "../src/handler.js";
import { describe, it } from "@std/testing/bdd";
import { mockPlayers } from "../src/dummy_data.js";
import { CONFIG } from "../src/config.js";

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

    it("Should return the players and territories with 1 troop allocated", () => {
      const allocatedData = {
        players: mockPlayers,
        territories: CONFIG.TERRITORIES,
      };
      const store = {
        "game": {
          initTerritories: () => allocatedData,
        },
      };

      const context = {
        get: (item) => store[item],
        json: (data) => data,
      };

      const acutalAllocatedData = handleInitTerritories(context);
      assertEquals(acutalAllocatedData, allocatedData);
    });
  });
});
