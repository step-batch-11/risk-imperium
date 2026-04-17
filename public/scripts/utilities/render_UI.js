import { updateCavalry } from "../features/cavalry_update.js";
import { STYLES } from "../configs/styles.js";

import { getAllPlayersDetail } from "../utilities.js";
import { createAvatar } from "../lobby/lobby.js";

export const loadMap = async () => {
  const mapContainer = document.querySelector(".map-layer");
  try {
    const response = await fetch("/assets/map.svg");
    const svgData = await response.text();
    mapContainer.innerHTML = svgData;
  } catch (error) {
    console.error("Failed to load the war room map:", error);
  }
};

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
  const currentPlayerContainer = document.querySelector(".username-display");
  const currentPlayerAvatarHolder = document.querySelector(
    "#current-player-avatar",
  );
  const currentPlayer = players[currentPlayerId];
  currentPlayerContainer.dataset.playerId = currentPlayerId;

  const avatar = createAvatar(currentPlayer.avatar);
  currentPlayerAvatarHolder.textContent = "";
  currentPlayerAvatarHolder.append(avatar);
  currentPlayerNameHolder.textContent = currentPlayer.name;
};

export const renderCurrentPlayerName = (gameState) => {
  const players = getAllPlayersDetail(gameState.player, gameState.opponents);
  renderCurrentUserTurn(players, gameState.currentPlayer);
};

export const renderGameState = (gameState) => {
  updateCavalry(gameState.cavalryPositions);
  const stateNameElement = document.querySelector("#game-state-name");

  const phase = gameState.state.replaceAll("_", " ");
  stateNameElement.textContent = `Phase: ${phase}`;
};
