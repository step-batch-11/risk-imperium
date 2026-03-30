import { assertEquals } from "@std/assert/equals";
import { handleGameSetup } from "../src/handler.js";
import { describe, it } from "@std/testing/bdd";

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
});
