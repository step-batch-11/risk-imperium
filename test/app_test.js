import { describe, it } from "@std/testing/bdd";
import { assert, assertEquals } from "@std/assert";
import { createApp } from "../src/app.js";
import { Hono } from "hono";
import { Game } from "../src/game.js";
import { STATES } from "../src/config.js";

it("Create app should return the instance of the Hono class", () => {
  const app = createApp({});
  const isHonoInstance = app instanceof Hono;
  assert(isHonoInstance);
});

describe("App Handler", () => {
  it("`GET /setup` should return the setup data for the user", async () => {
    const game = {
      getSetup(id) {
        return { data: "Game Setup Data", id };
      },
    };
    const app = createApp(game);
    const response = await app.request("/setup");
    const data = await response.json();

    assertEquals(response.status, 200);
    assertEquals(data, { data: "Game Setup Data", id: 1 });
  });

  describe("POST /user-actions", () => {
    it("REINFORCE user-actions should return updated troop count with their territory Id", async () => {
      const game = new Game();
      const gameState = game.getSetup();
      gameState.state = STATES.INITIAL_REINFORCEMENT;
      const app = createApp(game);
      const response = await app.request("/user-actions", {
        method: "POST",
        headers: { "content-type": "applications/json" },
        body: JSON.stringify({
          "userActions": "REINFORCE",
          data: { territoryId: 37, troopCount: 1 },
        }),
      });

      const { action, data } = await response.json();

      assertEquals(response.status, 200);
      assertEquals(response.ok, true);
      assertEquals(action, "INITIAL_REINFORCEMENT");
      assertEquals(data.territoryId, 37);
      assertEquals(data.newTroopCount, 1);
    });
  });
});
