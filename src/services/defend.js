import { STATES } from "../config.js";

const isValidDefenderTroopsCount = (game, territoryId, troopCount) => {
  const availableTroopCount = game.troopCountAtTerritory(
    territoryId,
  );

  const isInRange = troopCount <= 2 && troopCount > 0;
  return availableTroopCount >= troopCount && isInRange;
};

const validateDefend = (game, territoryId, count) => {
  if (!isValidDefenderTroopsCount(game, territoryId, count)) {
    throw new Error("Invalid Troop Count");
  }
};

export const defendService = (game, data) => {
  const { troopCount } = data;
  const { defenderTerritoryId } = game.stateDetails;

  validateDefend(game, defenderTerritoryId, troopCount);
  const defenderId = game.getOwnerOfTerritory(defenderTerritoryId);

  game.stateDetails.defenderTroopCount = troopCount;
  game.updateGame(STATES.DEFEND, {
    attackerId: game.activePlayerId,
    defenderId,
    defenderTroopCount: troopCount,
  }, game.activePlayerId);

  game.setNewState(STATES.RESOLVE_COMBAT);

  return {
    action: STATES.WAITING,
    data: game.stateDetails,
  };
};
