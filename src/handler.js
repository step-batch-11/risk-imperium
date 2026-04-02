export const handleGameSetup = (context) => {
  const game = context.get("game");
  const playerId = 1;
  return context.json(game.getSetup(playerId));
};
