const colorTerritories = (playerTerritories, playerId, territories) => {
  playerTerritories.forEach((tId) => {
    const { name } = territories[tId];
    const terrName = name.toLowerCase().replaceAll(" ", "-");
    const territoryElement = document.querySelector(`#${terrName}`);
    territoryElement.dataset.player = playerId;
  });
};

const allocateTroops = (territories) => {
  const territoryElements = document.querySelectorAll(".territory");
  territoryElements.forEach((territory) => {
    const territoryId = territory.dataset.territoryId;
    const { troopCount } = territories[territoryId];
    const troopCountElement = territory.querySelector(".troop-count tspan");
    troopCountElement.textContent = troopCount;
  });
};

export const renderTerritoriesAndTroops = (
  players,
  territories,
) => {
  for (const playerInfo of Object.values(players)) {
    colorTerritories(playerInfo.territories, playerInfo.id, territories);
    allocateTroops(territories);
  }
};
