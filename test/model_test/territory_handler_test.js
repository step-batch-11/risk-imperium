//   85 |   updateOwner(id, newOwnerId) {
//   86 |     this.#territories[id].ownerId = newOwnerId;
//   87 |     return newOwnerId;
//   88 |   }

import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import { TerritoriesHandler } from "../../src/models/territoryHandler.js";
import { assert } from "@std/assert/assert";
import { assertFalse } from "@std/assert/false";

describe("Territory handler", () => {
  let territoryHandler;
  beforeEach(() => {
    const territories = {
      1: { name: "Territory 1", troopCount: 0, ownerId: 1 },
    };
    territoryHandler = new TerritoriesHandler(territories);
  });

  describe(".get method", () => {
    it("Should return all the details about territory when id is passed  ", () => {
      const territory = territoryHandler.get(1);
      assertEquals(territory.name, "Territory 1");
    });

    it("Should return undefined when invalid id is passed  ", () => {
      const territory = territoryHandler.get(2);
      assertEquals(territory, undefined);
    });
  });

  describe(".setTroops method", () => {
    it("should update the count of troop ", () => {
      const newTroops = territoryHandler.setTroops(1, 10);
      assertEquals(newTroops, 10);
      const territory = territoryHandler.get(1);
      assertEquals(territory.troopCount, 10);
    });
  });

  describe(".setTroops method", () => {
    it("should update the count of troop ", () => {
      const newTroops = territoryHandler.setTroops(1, 10);
      assertEquals(newTroops, 10);
      const territory = territoryHandler.get(1);
      assertEquals(territory.troopCount, 10);
    });
  });

  describe(".isBarren method", () => {
    it("should return true it given territory is barren", () => {
      assert(territoryHandler.isBarren(1));
    });

    it("should return false when territory is not barren", () => {
      territoryHandler.setTroops(1, 10);
      assertFalse(territoryHandler.isBarren(1));
    });
  });

  describe(".updateOwner method", () => {
    it("should return new owner Id", () => {
      assertEquals(territoryHandler.updateOwner(1, 2), 2);

      const territory = territoryHandler.get(1);
      assertEquals(territory.ownerId, 2);
    });
  });
});
