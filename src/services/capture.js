import { STATES } from "../config.js";

const validateTroopCount = (troopCount, attackerTerritoryTroops) => {
  if (troopCount >= attackerTerritoryTroops || troopCount < 0) {
    throw new Error("Invalid troop count");
  }
};

export const captureService = (game, data) => {
  const troopCount = data;
  const { attackerTerritoryId, defenderTerritoryId } = game.stateDetails;

  const attackerTerritoryTroops = game.troopCountAtTerritory(
    attackerTerritoryId,
  );

  validateTroopCount(troopCount, attackerTerritoryTroops);

  game.decreaseTroops(attackerTerritoryId, troopCount);
  game.addTroops(defenderTerritoryId, troopCount);

  const updatedTerritories = game.getTerritoriesDetails(
    attackerTerritoryId,
    defenderTerritoryId,
  );

  const hasEliminated = game.isEliminated(game.stateDetails.defenderId);

  game.updateGame(
    STATES.MOVE_IN,
    {
      from: attackerTerritoryId,
      to: defenderTerritoryId,
      troopCount,
    },
    game.activePlayerId,
  );

  game.setNewState(STATES.INVASION);
  game.resetStateDetails();

  game.stateDetails = {};
  return {
    action: game.getGameState(),
    data: {
      updatedTerritories,
      hasEliminated,
      hasWon: game.hasPlayerWon(),
      newCards: game.activePlayer.cards,
    },
  };
};
