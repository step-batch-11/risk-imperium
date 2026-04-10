export const getMoveInDataService = (game) => ({
  action: game.getGameState(),
  data: game.lastUpdate,
});
