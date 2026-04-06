export class ReinforcementController {
  #territoriesHandler;
  #continentsHandler;
  #remainingReinforce;
  constructor(territoriesHandler, continentsHandler) {
    this.#territoriesHandler = territoriesHandler;
    this.#continentsHandler = continentsHandler;
    this.#remainingReinforce = 0;
  }

  #getReinforcementCount(playerId) {
    const territories = this.#territoriesHandler.getTerritoriesOf(playerId);
    const continentBonus = this.#continentsHandler.calculateContinentsBonus(
      territories,
    );

    const reinforcementForTerritory = Math.max(
      3,
      Math.floor(territories.length / 3),
    );
    return reinforcementForTerritory + continentBonus;
  }

  addExtraTroops(troopCount) {
    this.#remainingReinforce += troopCount;
  }

  setToReinforce(playerId) {
    this.#remainingReinforce += this.#getReinforcementCount(playerId);
  }

  reinforce(territoryId, troopCount) {
    if (troopCount > this.#remainingReinforce) {
      throw new Error("Bad troop count");
    }

    this.#territoriesHandler.addTroops(territoryId, troopCount);
    this.#remainingReinforce -= troopCount;

    return this.#remainingReinforce;
  }

  get isDone() {
    return this.#remainingReinforce === 0;
  }

  get remaining() {
    return this.#remainingReinforce;
  }

  get isNoTroopsAssigned() {
    return this.#remainingReinforce === 0;
  }

  loadState({ remainingReinforce }) {
    this.#remainingReinforce = remainingReinforce;
  }
  saveableState() {
    return {
      remainingReinforce: this.#remainingReinforce,
    };
  }
}
