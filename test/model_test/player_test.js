import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import { Player } from "../../src/models/player_handler.js";

describe("Player", () => {
  const name = "RAJ";
  let player;
  beforeEach(() => {
    player = new Player(1, name);
  });
  it("Should provide the name of the user when user.name is called", () => {
    assertEquals(player.name, name);
  });
});
