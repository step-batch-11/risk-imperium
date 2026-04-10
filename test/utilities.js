import { Cards } from "../src/models/cards.js";
import { Cavalry } from "../src/models/cavalry.js";
import { Continents } from "../src/models/continents.js";
import { Territories } from "../src/models/territory.js";

export const loadGameStateForTest = (game, savedState) => {
  const territories = structuredClone(savedState.territories);
  const handlers = {
    cavalry: new Cavalry(savedState.cavalry),
    territoriesHandler: new Territories(territories),
    continentsHandler: new Continents(),
    cardsHandler: new Cards(),
  };

  const controllers = {};

  game.loadGameState(savedState, handlers, controllers);
};
