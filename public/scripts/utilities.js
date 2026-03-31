export const getOwnedContinents = (player, continents) => {
  return Object.values(continents).filter((continent) => {
    continent.territories.every((territory) =>
      player.territories.includes(territory)
    );
  });
};

export const updateTroopCount = (territory, newTroopCount) => {
  const troopCount = territory.querySelector(".troop-count");
  troopCount.textContent = newTroopCount;
};

let notifyTimer;

export const showNotification = (message, status = "info", duration = 3000) => {
  const notification = document.querySelector("#notification-container");
  notification.className = `notification ${status}`;
  notification.textContent = message;

  clearTimeout(notifyTimer);

  notifyTimer = setTimeout(() => {
    notification.classList.remove(status);
  }, duration);
};

export const displayRemainingTroopsToDeploy = (remainingTroops) => {
  const display = document.querySelector("#remaining-troops-to-deploy");
  display.textContent = remainingTroops
    ? `Remaining Troops To Deploy: ${remainingTroops}`
    : "";
};

export const highlightTerritories = (territories) => {
  territories.forEach((territory) => {
    const territoryElement = document.querySelector(
      `[data-territory-id="${territory}"] > path`,
    );
    territoryElement.classList.add("selected");
  });
};
const renderCurrentUserTurn = (players, currentPlayerId) => {
  const currentPlayerNameHolder = document.querySelector(
    "#current-player-name",
  );
  const currentPlayer = players[currentPlayerId];

  currentPlayerNameHolder.textContent = currentPlayer.name;
};

export const getAllPlayersDetail = (player, opponents) => {
  const { id: currentPlayerId, ...details } = player;
  return { ...opponents, [currentPlayerId]: details };
};

export const renderCurrentPlayerName = (gameState) => {
  const players = getAllPlayersDetail(gameState.player, gameState.opponents);
  renderCurrentUserTurn(players, gameState.currentPlayer);
};

export const renderGameState = (state) => {
  const stateNameElement = document.querySelector("#game-state-name");
  stateNameElement.textContent = `Phase: ${state}`;
};
