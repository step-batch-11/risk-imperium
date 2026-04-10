import { Cards } from "../models/cards.js";
import { Cavalry } from "../models/cavalry.js";
import { Continents } from "../models/continents.js";
import { Territories } from "../models/territory.js";
import { InvasionController } from "./invasion_controller.js";

export const handleLoadGameState = async (c, readTextFile) => {
  const game = c.get("game");
  const { state } = c.req.param();
  return await readTextFile(`./data/states/${state}.json`)
    .then((data) => {
      const savedState = JSON.parse(data);

      const handlers = {
        cavalry: new Cavalry(savedState.cavalry),
        territoriesHandler: new Territories(savedState.territories),
        continentsHandler: new Continents(),
        cardsHandler: new Cards(),
      };

      const controllers = {
        invasionController: new InvasionController(handlers.territoriesHandler),
      };

      game.loadGameState(savedState, handlers, controllers);

      return c.redirect("/");
    })
    .catch((_) => {
      return c.body("Bad Request", 404);
    });
};
