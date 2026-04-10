import { STATES } from "../config.js";
import { ERROR_MESSAGE } from "../config/error_message.js";

export const initialReinforceService = (game, { territoryId }) => {
  const remainingTroops = game.dropOneTroop(territoryId);
  const updatedTerritory = game.getTerritoriesDetails(territoryId);

  const data = {
    updatedTerritory,
    remainingTroops,
  };

  game.updateGame(STATES.INITIAL_REINFORCEMENT, data, game.activePlayerId);
  game.changeTurn();

  return {
    action: STATES.WAITING,
    data: {
      ...data,
      currentPlayerId: game.activePlayerId,
    },
  };
};

const reinforceService = (game, data) => {
  const { territoryId, troopCount } = data;
  const remainingTroop = game.stateDetails.remainingTroopsCount;

  if (troopCount > remainingTroop) {
    throw ERROR_MESSAGE.INVALID_PARAMETERS;
  }

  game.addTroops(territoryId, troopCount);

  const troopsLeft = remainingTroop - troopCount;
  game.updateRemainingTroopCount(troopsLeft);
  game.stateDetails.remainingTroops = troopsLeft;

  const currentPlayerId = game.activePlayerId;

  const state = game.getGameState();
  game.updateGame(state, { territoryId, troopCount }, currentPlayerId);

  if (troopsLeft <= 0) {
    game.setNewState(STATES.INVASION);
  }

  const updatedTerritory = game.getTerritoriesDetails(territoryId);
  return {
    action: game.getGameState(),
    data: {
      updatedTerritory,
      remainingTroops: troopsLeft,
      currentPlayerId: game.activePlayerId,
    },
  };
};

export const reinforcementsServices = (game, data) => {
  const state = game.getGameState();
  if (state === STATES.INITIAL_REINFORCEMENT) {
    return initialReinforceService(game, data);
  }
  if (state === STATES.REINFORCE) {
    return reinforceService(game, data);
  }
  throw ERROR_MESSAGE.INVALID_PARAMETERS;
};
