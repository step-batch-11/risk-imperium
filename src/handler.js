export const handleGameSetup = (context) => {
  const game = context.get("game");
  const playerId = 1;
  return context.json(game.getSetup(playerId));
};

export const handleGetGameState = (context) => {
  const game = context.get("game");
  return context.json(game.getGameState());
};
