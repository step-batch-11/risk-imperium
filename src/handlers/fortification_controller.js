export class FortificationController {
  #territories;

  constructor(territories) {
    this.#territories = territories;
  }

  #continuousNeighbour(currentTerritory, owned, covered) {
    const set = [];
    for (const territoryId of currentTerritory.neighbours) {
      if (owned.includes(territoryId) && !covered.includes(territoryId)) {
        covered.push(territoryId);
        set.push(territoryId);
        const newTer = this.#territories[territoryId];
        set.push(...this.#continuousNeighbour(newTer, owned, covered));
      }
    }
    return set;
  }

  #findTerritory(ownedTerritories) {
    const sets = [];
    const covered = [];
    for (const singleTerritoryId of ownedTerritories) {
      if (
        !covered.includes(singleTerritoryId) &&
        ownedTerritories.includes(singleTerritoryId)
      ) {
        covered.push(singleTerritoryId);
        const ter = this.#territories[singleTerritoryId];
        const set = this.#continuousNeighbour(ter, ownedTerritories, covered);
        sets.push([singleTerritoryId, ...set]);
      }
    }

    return sets.filter(
      (each) =>
        each.length > 1 && each.some((t) => this.#territories[t].troopCount),
    );
  }

  #getFortifiableTerritory(playerTerritories) {
    return this.#findTerritory(playerTerritories);
  }

  #moveTroopsBetween(from, to, count) {
    const fromTerritory = this.#territories[from];
    const toTerritory = this.#territories[to];
    fromTerritory.troopCount -= count;
    toTerritory.troopCount += count;
  }

  moveTroops(from, to, count, playerTerritories) {
    const territoriesSets = this.#getFortifiableTerritory(playerTerritories);
    const territorySetWithFromLocation = territoriesSets.find((set) =>
      set.includes(from)
    );
    if (!territorySetWithFromLocation) {
      throw new Error("Invalid Territory!");
    }
    if (!territorySetWithFromLocation.includes(to)) {
      throw new Error("Territories are not connected");
    }
    const fromTerritoryTroopCount = this.#territories[from].troopCount;
    if (fromTerritoryTroopCount < count + 1) {
      throw new Error("InValid troop Count");
    }
    return [from, to];
  }
}
