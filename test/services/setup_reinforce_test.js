import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { getReinforcementCount } from "../../src/services/setup_reinforce.js";

describe("SET UP REINFORCEMENT", () => {
  it("get reinforcement count should return reinforcement count according to the territories", () => {
    const territories = [
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      23,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
    ];
    assertEquals(getReinforcementCount(territories), 19);
  });
});
