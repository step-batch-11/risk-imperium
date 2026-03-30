import { addListernerToPlayerIcon } from "../listeners.js";
import { getOwnedContinents } from "../utilities.js";

const renderPlayerDetails = (player, continents) => {
  const playerDetailsTemplate = document.querySelector(
    "#single-player-detail-template",
  );
  const clone = playerDetailsTemplate.content.cloneNode(true);

  const nameElement = clone.querySelector(".name");

  nameElement.textContent = player.name;

  const territoryCountElement = clone.querySelector(".territory-count");
  const territoryCount = player.territories.length;
  territoryCountElement.textContent = territoryCount;

  const continentsCountElement = clone.querySelector(".continent-count");
  const owndedContinents = getOwnedContinents(player, continents);
  continentsCountElement.textContent = owndedContinents.length;
  return clone;
};

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

  const playerDetailsDialog = document.querySelector(
    "#player-details-container",
  );
  const allPlayersDetails = Object.values(players).map((player) =>
    renderPlayerDetails(player, gameState.continents)
  );
  playerDetailsDialog.append(...allPlayersDetails);

  addListernerToPlayerIcon(players, gameState.continents);
};
