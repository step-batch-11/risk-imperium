import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import { Player } from "../../src/models/player.js";
import { AVATARS } from "../../src/config.js";

describe("Player", () => {
  const name = "RAJ";
  let player;
  beforeEach(() => {
    player = new Player(1, name, AVATARS[0]);
  });

  it("Should provide the name of the user when user.name is called", () => {
    assertEquals(player.name, name);
  });
  it("Should provide the avatar of player ", () => {
    assertEquals(player.avatar, AVATARS[0]);
  });
  it("get avatar should retun the  avatar when called", () => {
    assertEquals(player.avatar, AVATARS[0]);
  });

  it("isLeft should default to false", () => {
    assertEquals(player.isLeft, false);
  });

  it("isLeft should be settable", () => {
    player.isLeft = true;
    assertEquals(player.isLeft, true);
  });

  it("setting isLeft should not affect other properties", () => {
    player.isLeft = true;
    assertEquals(player.name, name);
    assertEquals(player.avatar, AVATARS[0]);
  });
});
