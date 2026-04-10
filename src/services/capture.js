import { STATES } from "../config.js";

export const captureService = (game, data) => {
  const troopCount = data;
  const { attackerTerritoryId, defenderTerritoryId } = game.stateDetails;
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
