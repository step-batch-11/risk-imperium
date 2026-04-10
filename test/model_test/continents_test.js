import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { CONFIG } from "../../src/config.js";
import { Continents } from "../../src/models/continents.js";

describe(" CONTINENTS HANDLER", () => {
  let continentsHandler;

  beforeEach(() => {
    continentsHandler = new Continents();
  });

  it("get continents should return the continents list", () => {
    const continents = continentsHandler.getContinents();
    assertEquals(continents, CONFIG.CONTINENTS);
  });

  it("get continent should return the continent", () => {
    const continent = continentsHandler.getContinent(1);
    assertEquals(continent, CONFIG.CONTINENTS[1]);
  });

  it("get armies should return the army of continent", () => {
    const armies = continentsHandler.getArmies(1);
    assertEquals(armies, CONFIG.CONTINENTS[1].armies);
  });

  it("get territories should return the territories of continent", () => {
    const territories = continentsHandler.getTerritories(1);
    assertEquals(territories, CONFIG.CONTINENTS[1].territories);
  });

  it("calculate continent bonus should return bonus as 0 if no territories are provided", () => {
    const continentBonus = continentsHandler.calculateContinentsBonus([]);
    assertEquals(continentBonus, 0);
  });

  it("calculate continent bonus should return bonus reinforcement of 1 continent", () => {
    const testContinent = CONFIG.CONTINENTS[1];
    const continentBonus = continentsHandler.calculateContinentsBonus(
      testContinent.territories,
    );
    assertEquals(continentBonus, testContinent.armies);
  });

  it("calculate continent bonus should return bonus reinforcement of multiple continents", () => {
    const testContinent1 = CONFIG.CONTINENTS[1];
    const testContinent2 = CONFIG.CONTINENTS[2];
    const territoryIds = [
      ...testContinent1.territories,
      ...testContinent2.territories,
    ];
    const continentBonus = continentsHandler.calculateContinentsBonus(
      territoryIds,
    );

    assertEquals(continentBonus, testContinent1.armies + testContinent2.armies);
  });
});
