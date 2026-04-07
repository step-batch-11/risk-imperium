export const handleSaveGameState = (c, writeTextFile) => {
  const game = c.getSavableGameState("game");
  const { name } = c.req.param();
  const gameState = game.getSavableGameState();
  const savingData = JSON.stringify(gameState);
  writeTextFile(`./data/states/${name}.json`, savingData);
  return c.redirect("/");
};
