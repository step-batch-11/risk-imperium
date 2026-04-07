export class InvasionController {
  #territoriesHandler;
  #isDone;
  #attackerId;
  #attackFrom;
  #attackTo;
  #attackerTroopsCount;
  #defenderTroopsCount;
  #state;
  #randomFunction;
  #isCaptured;
  #isAttackSuccessful;
  #attackerDice;
  #defenderDice;

  constructor(territoriesHandler, randomFunction = Math.random) {
    this.#territoriesHandler = territoriesHandler;
    this.#randomFunction = randomFunction;
    this.#state = "start";

    this.#isDone = false;

    this.#attackFrom = null;
    this.#attackTo = null;
    this.#attackerId = null;
    this.#defenderTroopsCount = null;
    this.#attackerTroopsCount = null;
    this.#isCaptured = null;
    this.#isAttackSuccessful = null;

    this.#attackerDice = null;
    this.#defenderDice = null;
  }

  get isDone() {
    return this.#isDone;
  }

  get state() {
    return this.#state;
  }

  #rollDice(count) {
    return Array.from(
      { length: count },
      () => Math.ceil(this.#randomFunction() * 6),
    ).sort((a, b) => b - a);
  }

  #calculateLoss(defenderDice, attackerDice) {
    const combatResult = { attackerLoss: 0, defenderLoss: 0 };
    const dicesCount = Math.min(defenderDice.length, attackerDice.length);
    for (let index = 0; index < dicesCount; index++) {
      attackerDice[index] <= defenderDice[index]
        ? combatResult.attackerLoss++
        : combatResult.defenderLoss++;
    }
    return combatResult;
  }

  #isValidAttacker(attackerTerritoryId, attackerId) {
    return this.#territoriesHandler.isTerritoryOwnBy(
      attackerTerritoryId,
      attackerId,
    );
  }

  #isValidAttackerTroopsCount(attackerTerritoryId, troopCount) {
    const availableTroopCount = this.#territoriesHandler.getTroopsCount(
      attackerTerritoryId,
    );
    const isInRange = troopCount <= 3 && troopCount > 0;
    return availableTroopCount > troopCount && isInRange;
  }
  #isValidDefenderTroopsCount(defenderTerritoryId, troopCount) {
    const availableTroopCount = this.#territoriesHandler.getTroopsCount(
      defenderTerritoryId,
    );
    const isInRange = troopCount <= 2 && troopCount > 0;
    return availableTroopCount > troopCount && isInRange;
  }

  #isValidDefender(attackerId, attackerTerritoryId, defenderTerritoryId) {
    const neighbours = this.#territoriesHandler.getNeighbours(
      attackerTerritoryId,
    );

    const isNeighbour = neighbours.includes(defenderTerritoryId);

    const isEnemy = !this.#territoriesHandler.isTerritoryOwnBy(
      defenderTerritoryId,
      attackerId,
    );
    return isNeighbour && isEnemy;
  }

  #captureTerritory() {
    this.#territoriesHandler.decreaseTroops(
      this.#attackFrom,
      this.#attackerTroopsCount,
    );
    this.#territoriesHandler.setTroops(
      this.#attackTo,
      this.#attackerTroopsCount,
    );
    this.#territoriesHandler.updateOwner(this.#attackTo, this.#attackerId);
  }

  #handleCapture() {
    if (this.#territoriesHandler.isBarren(this.#attackTo)) {
      this.#isCaptured = true;
      this.#captureTerritory();
    }
  }
  setNewInvasion(attackerId, from, to, count) {
    this.#isCaptured = false;

    if (!this.#isValidAttacker(from, attackerId)) {
      throw new Error("Invalid Attacker");
    }

    if (!this.#isValidAttackerTroopsCount(from, count)) {
      throw new Error("Invalid Attacker Troops Count");
    }

    if (!this.#isValidDefender(attackerId, from, to)) {
      throw new Error("Invalid Defender Territory");
    }

    this.#isDone = false;
    this.#attackerId = attackerId;
    this.#attackFrom = from;
    this.#attackTo = to;
    this.#attackerTroopsCount = count;
    this.#state = "invasion";
  }

  setDefenderTroops(count) {
    if (this.#isValidDefenderTroopsCount(count)) {
      throw new Error("Invalid Troop Count");
    }
    this.#state = "defend";
    this.#defenderTroopsCount = count;
  }

  resolve() {
    this.#attackerDice = this.#rollDice(this.#attackerTroopsCount);
    this.#defenderDice = this.#rollDice(this.#defenderTroopsCount);

    const { attackerLoss, defenderLoss } = this.#calculateLoss(
      this.#defenderDice,
      this.#attackerDice,
    );

    this.#isAttackSuccessful = attackerLoss < defenderLoss;

    this.#territoriesHandler.decreaseTroops(this.#attackFrom, attackerLoss);
    this.#territoriesHandler.decreaseTroops(this.#attackTo, defenderLoss);

    this.#handleCapture();

    this.#state = "resolved";
    return [this.#attackFrom, this.#attackTo];
  }

  moveIn(troopCount) {
    this.#territoriesHandler.decreaseTroops(this.#attackFrom, troopCount);
    this.#territoriesHandler.addTroops(this.#attackTo, troopCount);
    this.#isDone = true;
    this.#state = "moved-in";
    return [this.#attackFrom, this.#attackTo];
  }

  reset() {
    this.#attackFrom = null;
    this.#attackTo = null;
    this.#attackerId = null;
    this.#defenderTroopsCount = null;
    this.#attackerTroopsCount = null;
    this.#isCaptured = null;
    this.#isDone = false;
    this.#attackerDice = null;
    this.#defenderDice = null;
  }

  get invadeDetails() {
    return {
      attackerDice: this.#attackerDice,
      defenderDice: this.#defenderDice,
      attackerTerritoryId: this.#attackFrom,
      defenderTerritoryId: this.#attackTo,
      attackerTroops: this.#attackerTroopsCount,
      defenderTroops: this.#defenderTroopsCount,
    };
  }

  get isCaptured() {
    return this.#isCaptured;
  }
  get isAttackSuccessful() {
    return this.#isAttackSuccessful;
  }

  loadState(state) {
    this.#isDone = state.isDone;
    this.#attackerId = state.attackerId;
    this.#attackFrom = state.attackFrom;
    this.#attackTo = state.attackTo;
    this.#attackerTroopsCount = state.attackerTroopsCount;
    this.#defenderTroopsCount = state.defenderTroopsCount;
    this.#state = state.state;
    this.#isCaptured = state.isCaptured;
    this.#isAttackSuccessful = state.isAttackSuccessful;
    this.#attackerDice = state.attackerDice;
    this.#defenderDice = state.defenderDice;
  }

  saveableState() {
    return {
      isDone: this.#isDone,
      attackerId: this.#attackerId,
      attackFrom: this.#attackFrom,
      attackTo: this.#attackTo,
      attackerTroopsCount: this.#attackerTroopsCount,
      defenderTroopsCount: this.#defenderTroopsCount,
      state: this.#state,
      isCaptured: this.#isCaptured,
      isAttackSuccessful: this.#isAttackSuccessful,
      attackerDice: this.#attackerDice,
      defenderDice: this.#defenderDice,
    };
  }
}
