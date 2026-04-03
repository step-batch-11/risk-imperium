import { FortificationHandler } from "../models/fortification_handler.js";

export const handleLoadGameState = async (c, readTextFile, game) => {
  const { state } = c.req.param();
  return await readTextFile(`./data/states/${state}.json`).then((data) => {
    const savedState = JSON.parse(data);
    const handler = {
      fortificationHandler: new FortificationHandler(savedState.territories),
    };
    game.loadGameState(savedState, handler);
    return c.redirect("/");
  }).catch(() => {
    return c.body("Bad Request", 404);
  });
};
