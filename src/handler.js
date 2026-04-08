export const handleGameSetup = (context) => {
  const game = context.get("game");

  const playerId = context.get("playerId");
  return context.json(game.getSetup(playerId));
};
