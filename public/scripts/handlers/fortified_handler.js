const continuousNeighbour = (territories, ter, owned, covered) => {
  const set = [];
  for (const t of ter.neighbours) {
    if (owned.includes(t) && !covered.includes(t)) {
      covered.push(t);
      set.push(t);
      const newTer = territories[t];
      set.push(...continuousNeighbour(territories, newTer, owned, covered));
    }
  }
  return set;
};
const findTerritory = (territories, owned) => {
  const sets = [];
  const covered = [];
  for (const singleId of owned) {
    if (!covered.includes(singleId) && owned.includes(singleId)) {
      covered.push(singleId);
      const ter = territories[singleId];
      const set = continuousNeighbour(territories, ter, owned, covered);
      sets.push([singleId, ...set]);
    }
  }

  return (sets.filter((each) =>
    each.length > 1 && each.some((t) => territories[t].troopCount)
  ));
};
export const getFortifiableTerritory = (gameState) => {
  const territories = gameState.territories;
  const owned = gameState.player.territories;
  return findTerritory(territories, owned);
};

export const territoryToFortifyFrom = (gameState) => {
  const fortifiableTerritorySet = getFortifiableTerritory(gameState);
  const fortifiableTerritories = fortifiableTerritorySet.flat();
  return fortifiableTerritories.filter((tid) => {
    const territory = gameState.territories[tid];
    return territory.troopCount > 1;
  });
};
