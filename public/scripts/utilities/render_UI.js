import { updateCavalry } from "../features/cavalry_update.js";
import { STYLES } from "../configs/styles.js";

import { getAllPlayersDetail } from "../utilities.js";

export const renderUpdatedTroopCount = (territory, newTroopCount) => {
  const troopCount = territory.querySelector(".troop-count tspan");
  troopCount.textContent = newTroopCount;
};

export const renderRemainingTroopsToDeploy = (remainingTroops) => {
  const container = document.querySelector("#remaining-troops-to-deploy");
  const display = container.querySelector("#remaining-troops");

  if (remainingTroops) {
    container.classList.remove(STYLES.HIDDEN);
    display.textContent = remainingTroops;
    return;
  }

  container.classList.add(STYLES.HIDDEN);
};

const renderCurrentUserTurn = (players, currentPlayerId) => {
  const currentPlayerNameHolder = document.querySelector(
    "#current-player-name",
  );
  const currentPlayer = players[currentPlayerId];

  currentPlayerNameHolder.textContent = currentPlayer.name;
};

export const renderCurrentPlayerName = (gameState) => {
  const players = getAllPlayersDetail(gameState.player, gameState.opponents);
  renderCurrentUserTurn(players, gameState.currentPlayer);
};

export const renderGameState = (gameState) => {
  updateCavalry(gameState.cavalryPositions);
  const stateNameElement = document.querySelector("#game-state-name");
  stateNameElement.textContent = `Phase: ${gameState.state}`;
};
