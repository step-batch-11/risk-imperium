export class InitialReinforcementController {
  #isDone;
  #playersCount;
  #troops;
  #round;
  #territoryHandler;
  #remainingTroopPerPlayer;

  constructor(playersCount, territoryHandler, troopsCount = 13) {
    this.#isDone = false;
    this.#round = 0;
    this.#troops = troopsCount;
    this.#playersCount = playersCount;
    this.#territoryHandler = territoryHandler;
  }

  addOne(territoryId) {
    this.#territoryHandler.addTroops(territoryId, 1);
    this.#round++;
    const deployedTroopsPerPlayer = this.#round / this.#playersCount;
    this.#isDone = deployedTroopsPerPlayer === this.#troops;
    return this.#troops - Math.floor(deployedTroopsPerPlayer);
  }

  get isDone() {
    return this.#isDone;
  }

  get remainingTroop() {
    const deployedTroopsPerPlayer = this.#round / this.#playersCount;
    return this.#troops - Math.floor(deployedTroopsPerPlayer);
  }

  saveableState() {
    return {
      round: this.#round,
      troops: this.#troops,
      isDone: this.#isDone,
      playersCount: this.#playersCount,
    };
  }

  loadGameState({ round, troops, isDone, playersCount }) {
    this.#round = round;
    this.#troops = troops;
    this.#isDone = isDone;
    this.#playersCount = playersCount;
  }
}
