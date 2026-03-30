const highlightTerritories = (territories) => {
  territories.forEach((territoryId) => {
    const territoryElement = document.querySelector(
      `[data-territory-id="${territoryId}"]`,
    );

    territoryElement.parentElement.append(territoryElement);

    territoryElement.classList.add("highlight");
  });
};

export const highlightOwnTerritories = (players, territories) => {
  const territoriesWithMin2Troops = players.territories.filter(
    (territoryId) => territories[territoryId].troopCount > 1,
  );
  highlightTerritories(territoriesWithMin2Troops);
};

export const highlightNeighboursTerritories = (
  player,
  selectedTerritoryId,
  territories,
) => {
  const neighbours = territories[selectedTerritoryId].neighbours;
  const opponentNeighbours = neighbours.filter(
    (neighbour) => !player.territories.includes(neighbour),
  );

  highlightTerritories(opponentNeighbours);
};

export const getOwnedContinents = (player, continents) => {
  return Object.values(continents).filter((continent) => {
    continent.territories.every((territory) =>
      player.territories.includes(territory)
    );
  });
};

export const longPool = async (api) => {
  const res = await fetch(api);
  if (res.status === 204) {
    return longPool(api);
  }
  return res.json();
};

export const updateTroopCount = (territory, { newTroopCount }) => {
  const troopCount = territory.querySelector(".troop-count");
  troopCount.textContent = newTroopCount;
};
