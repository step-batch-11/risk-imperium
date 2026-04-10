import { STATES } from "../config.js";

const isValidAttacker = (game, attackerTerritoryId, attackerId) => {
  return game.isTerritoryOwnBy(
    attackerTerritoryId,
    attackerId,
  );
};

const isValidAttackerTroopsCount = (game, territoryId, troopCount) => {
  const availableTroopCount = game.troopCountAtTerritory(territoryId);
  const isInRange = troopCount <= 3 && troopCount > 0;
  return availableTroopCount > troopCount && isInRange;
};

const isValidDefender = (
  game,
  attackerId,
  attackerTerritoryId,
  defenderTerritoryId,
) => {
  const isNeighbour = game.isNeighbouringTerritory(
    attackerTerritoryId,
    defenderTerritoryId,
  );

  const isEnemy = !game.isTerritoryOwnBy(
    defenderTerritoryId,
    attackerId,
  );
  return isNeighbour && isEnemy;
};

const validateInvasion = (game, from, to, attackerId, count) => {
  if (!isValidAttacker(game, from, attackerId)) {
    throw new Error("Invalid Attacker");
  }

  if (!isValidAttackerTroopsCount(game, from, count)) {
    throw new Error("Invalid Attacker Troops Count");
  }

  if (!isValidDefender(game, attackerId, from, to)) {
    throw new Error("Invalid Defender Territory");
  }
};

export const invadeService = (game, data) => {
  const { attackerTerritoryId, attackerTroops, defenderTerritoryId } = data;
  const attackerId = game.activePlayerId;

  validateInvasion(
    game,
    attackerTerritoryId,
    defenderTerritoryId,
    attackerId,
    attackerTroops,
  );
  game.stateDetails.attackerTerritoryId = attackerTerritoryId;
  game.stateDetails.attackerTroops = attackerTroops;
  game.stateDetails.defenderTerritoryId = defenderTerritoryId;
  const defenderId = game.getOwnerOfTerritory(defenderTerritoryId);
  game.stateDetails.defenderId = defenderId;

  game.updateGame(
    STATES.INVASION,
    {
      attackerId,
      defenderId,
      attackerTerritoryId,
      defenderTerritoryId,
      attackerTroops,
    },
    game.activePlayerId,
  );

  game.setNewState(STATES.DEFEND);

  return { newState: STATES.WAITING, data: {} };
};
