import { CONFIG } from "../config.js";

export class ContinentsHandler {
  #continents;
  constructor(continents = CONFIG.CONTINENTS) {
    this.#continents = continents;
  }

  getContinents() {
    return this.#continents;
  }

  getContinent(id) {
    return this.#continents[id];
  }

  getArmies(id) {
    return this.#continents[id].armies;
  }

  getTerritories(id) {
    return this.#continents[id].territories;
  }

  getOwnedContients = (territoryIds) => {
    return Object.values(this.#continents).filter(
      (continent) =>
        continent.territories.every((territoryId) =>
          territoryIds.includes(territoryId)
        ),
    );
  };

  calculateContinentsBonus(territoryIds) {
    const ownedContinents = this.getOwnedContients(territoryIds);

    return ownedContinents.reduce((total, { armies }) => total + armies, 0);
  }
}
