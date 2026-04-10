import { STATES } from "../config.js";
import { getReinforcementCount } from "./setup_reinforce.js";

export const setupService = (game) => {
  const playerTerritory = game.activePlayerTerritory;

  if (game.getGameState() === STATES.INITIAL_REINFORCEMENT) {
    const troopsToReinforce = game.remainingTroop;
    console.log({ troopsToReinforce });

    return {
      action: game.getGameState(),
      data: { troopsToReinforce },
    };
  }

  if (game.getGameState() === STATES.REINFORCE) {
    const troopsToDeploy = getReinforcementCount(playerTerritory);
    if (!(game.stateDetails.remainingTroopsCount)) {
      game.addReinforcementTroops(troopsToDeploy);
    }

    return {
      action: game.getGameState(),
      data: { troopsToReinforce: game.stateDetails.remainingTroopsCount },
    };
  }
  throw ERROR_MESSAGE.INVALID_PARAMETERS;
};
