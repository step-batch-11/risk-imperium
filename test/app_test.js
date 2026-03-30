import { describe, it } from "@std/testing/bdd";
import { assert, assertEquals } from "@std/assert";
import { createApp } from "../src/app.js";
import { Hono } from "hono";

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
});
