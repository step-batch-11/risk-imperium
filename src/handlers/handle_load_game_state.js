import { Cavalry } from "../models/cavalry.js";
import { ContinentsHandler } from "../models/continents_handler.js";
import { TerritoriesHandler } from "../models/territoryHandler.js";
import { FortificationController } from "./fortification_controller.js";
import { InitialReinforcementController } from "./initial_reinforcement_controller.js";
import { InvasionController } from "./invasion_controller.js";
import { ReinforcementController } from "./reinforcement_controller.js";

export const handleLoadGameState = async (c, readTextFile) => {
  const game = c.loadGameState("game");
  const { state } = c.req.param();
  return await readTextFile(`./data/states/${state}.json`).then((data) => {
    const savedState = JSON.parse(data);

    const handlers = {
      cavalry: new Cavalry(savedState.cavalry),
      territoriesHandler: new TerritoriesHandler(savedState.territories),
      fortificationHandler: new FortificationController(savedState.territories),
      continentsHandler: new ContinentsHandler(),
    };

    const controllers = {
      initialReinforcementController: new InitialReinforcementController(
        1,
        handlers.territoriesHandler,
      ),
      reinforcementController: new ReinforcementController(
        handlers.territoriesHandler,
        handlers.continentsHandler,
      ),
      invasionController: new InvasionController(handlers.territoriesHandler),
    };

    game.loadGameState(savedState, handlers, controllers);

    return c.redirect("/");
  }).catch((e) => {
    console.log(e);

    return c.body("Bad Request", 404);
  });
};
