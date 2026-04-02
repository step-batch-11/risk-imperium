export const getOwnedContinents = (player, continents) => {
  return Object.values(continents).filter((continent) => {
    continent.territories.every((territory) =>
      player.territories.includes(territory)
    );
  });
};

export const getAllPlayersDetail = (player, opponents) => {
  const { id: currentPlayerId } = player;

  return { ...opponents, [currentPlayerId]: player };
};

export const setTroopLimit = (maxTroops, min = 1) => {
  const input = document.querySelector("#troop-count-input");
  input.max = maxTroops;
  input.min = min;
};

const getTerritoryElementIdByTerritoryId = (territories, territoryId) => {
  const territoryName = territories[territoryId].name;
  return territoryName.toLowerCase().replaceAll(" ", "-");
};

export const getTerritoryElementById = (territories, territoryId) => {
  const territoryElementId = getTerritoryElementIdByTerritoryId(
    territories,
    territoryId,
  );

  const territoryElement = document.querySelector(`#${territoryElementId}`);

  return territoryElement;
};

export const updateTroopsInTerritories = (gameState, territories) => {
  territories.forEach(({ territoryId, troopCount }) => {
    const territoryElement = getTerritoryElementById(
      gameState.territories,
      territoryId,
    );
    const territoryTroopCountElement = territoryElement.querySelector(
      ".troop-count",
    );

    territoryTroopCountElement.textContent = troopCount;
    gameState.territories[territoryId].troopCount = troopCount;
  });
};

export const delay = (duration) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, duration);
  });
};
