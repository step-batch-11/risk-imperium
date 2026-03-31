import { addListenersToPlayerIcon } from "../listeners.js";
import { getAllPlayersDetail, getOwnedContinents } from "../utilities.js";

const renderPlayerDetails = (player, continents) => {
  const playerDetailsTemplate = document.querySelector(
    "#single-player-detail-template",
  );
  const clone = playerDetailsTemplate.content.cloneNode(true);
  const nameElement = clone.querySelector(".name");

  nameElement.textContent = player.name;

  const territoryCountElement = clone.querySelector(".territory-count");
  const territoryCount = player.territories.length;
  territoryCountElement.textContent = `T: ${territoryCount}`;

  const continentsCountElement = clone.querySelector(".continent-count");
  const ownedContinents = getOwnedContinents(player, continents);

  continentsCountElement.textContent = `C : ${ownedContinents.length}`;
  return clone;
};

export const setup = (gameState) => {
  const playerDetailsDialog = document.querySelector(
    "#player-details-container",
  );

  const players = getAllPlayersDetail(gameState.player, gameState.opponents);
  const allPlayersDetails = Object.values(players).map((player) =>
    renderPlayerDetails(player, gameState.continents)
  );

  playerDetailsDialog.append(...allPlayersDetails);
  addListenersToPlayerIcon(players, gameState.continents);
};
