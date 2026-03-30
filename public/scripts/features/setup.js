const renderCurrentUserTurn = (players, currentPlayerId) => {
  const currentPlayerNameHolder = document.querySelector(
    "#current-player-name",
  );
  const currentPlayer = players[currentPlayerId];
  currentPlayerNameHolder.textContent = currentPlayer.name;
};

const getAllPlayersDetail = (player, opponents) => {
  const { id: currentPlayerId, ...details } = player;
  return { ...opponents, [currentPlayerId]: details };
};

export const setup = (gameState) => {
  const players = getAllPlayersDetail(gameState.player, gameState.opponents);
  renderCurrentUserTurn(players, gameState.currentPlayer);
};
