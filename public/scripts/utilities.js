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
