import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { Cavalry } from "../src/models/cavalry.js";

describe("Cvalry class tests ", () => {
  let cavalry;
  beforeEach(() => {
    cavalry = new Cavalry();
  });

  it("should get current postion", () => {
    const position = cavalry.getCurrentCount();
    assertEquals(position, 4);
  });
  it("if at max should return 60", () => {
    cavalry.moveToMax();
    const positions = cavalry.getPositions();
    assertEquals(positions, [55, 60, 60]);
  });
  it("should move the cavalry ", () => {
    const result = cavalry.moveCavalry();
    assertEquals(result, "moved");
  });
  it("should cavalry positions ", () => {
    const position = cavalry.getPositions();
    assertEquals(position, [0, 4, 6]);
  });
  it("should move cavalry position to max ", () => {
    const result = cavalry.moveToMax();
    assertEquals(result, "at max");
  });
  it("should not move to more than 60 ", () => {
    cavalry.moveToMax();
    const result = cavalry.moveCavalry();
    assertEquals(result, "is at max");
  });
});
