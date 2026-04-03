import { updateCavalry } from "../features/cavalryUpdate.js";
import { getAllPlayersDetail } from "../utilities.js";

export const renderUpdatedTroopCount = (territory, newTroopCount) => {
  const troopCount = territory.querySelector(".troop-count");
  troopCount.textContent = newTroopCount;
};

export const renderRemainingTroopsToDeploy = (remainingTroops) => {
  const display = document.querySelector("#remaining-troops-to-deploy");

  display.textContent = remainingTroops
    ? `Remaining Troops To Deploy: ${remainingTroops}`
    : "";
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
