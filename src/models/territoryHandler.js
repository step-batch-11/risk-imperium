export class TerritoriesHandler {
  #territories;

  constructor(territories) {
    this.#territories = territories;
  }

  get territories() {
    return structuredClone(this.#territories);
  }

  assignRandomTerritories(playerIds, shuffler) {
    const territoriesIds = Object.keys(this.#territories);
    const shuffledTerritories = territoriesIds.toSorted(() => shuffler() - 0.5);
    const parts = territoriesIds.length / playerIds.length;

    for (let index = 0; index < shuffledTerritories.length; index++) {
      const territoryId = shuffledTerritories[index];
      const playerId = Math.floor(index / parts);

      this.#territories[territoryId].ownerId = playerIds[playerId];
    }
  }

  getTroopsCount(id) {
    return this.#territories[id].troopCount;
  }

  get(id) {
    return structuredClone(this.#territories[id]);
  }

  getNeighbours(id) {
    return structuredClone(this.#territories[id].neighbours);
  }

  addTroops(id, count) {
    return this.#territories[id].troopCount += count;
  }

  decreaseTroops(id, count) {
    return this.#territories[id].troopCount -= count;
  }

  setTroops(id, count) {
    return this.#territories[id].troopCount = count;
  }
  isBarren(id) {
    return this.#territories[id].troopCount === 0;
  }

  getTerritoryAndTroopsCount(...ids) {
    const territoriesDetails = [];
    for (const id of ids) {
      const troopCount = this.getTroopsCount(id);
      territoriesDetails.push({ territoryId: id, troopCount });
    }
    return territoriesDetails;
  }
  setInitTroops() {
    for (const id in this.#territories) {
      this.addTroops(id, 1);
    }
  }

  getTerritories() {
    return structuredClone(this.#territories);
  }

  isTerritoryOwnBy(id, ownerId) {
    return this.#territories[id].ownerId === ownerId;
  }

  getTerritoriesOf(playerId) {
    const data = Object.entries(this.#territories)
      .filter(([_, { ownerId }]) => ownerId === playerId)
      .map(([id]) => Number(id));

    return data;
  }
  getOwnerOf(id) {
    return this.#territories[id].ownerId;
  }

  updateOwner(id, newOwnerId) {
    this.#territories[id].ownerId = newOwnerId;
    return newOwnerId;
  }

  moveTroops(fromId, toId, troopCount) {
    this.decreaseTroops(fromId, troopCount);
    this.addTroops(toId, troopCount);
    return this.getTerritoryAndTroopsCount(fromId, toId);
  }

  get isConquered() {
    const firstOwnerId = this.#territories[1].ownerId;
    return Object.values(this.#territories).every(({ ownerId }) =>
      ownerId === firstOwnerId
    );
  }
}
