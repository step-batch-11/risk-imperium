import { CONFIG, STATES } from "./config.js";
import { mockPlayers } from "./dummy_data.js";

export class Game {
  #activePlayerId;
  #territory;
  #players;
  #continents;
  #state;
  #randomFunction;
  #stateDetails;

  constructor(
    randomFunction = Math.random,
    players = mockPlayers(),
    territories = CONFIG.TERRITORIES,
    continents = CONFIG.CONTINENTS,
  ) {
    this.#randomFunction = randomFunction;
    this.#activePlayerId = players[0].id;
    this.#territory = territories;
    this.#players = players;
    this.#continents = continents;
    this.#state = STATES.SETUP;
    this.#stateDetails = {
      initialTroopLimit: 13,
      remainingTroopsToDeploy: 0,
      attackerTerritoryId: "21",
      defenderTerritoryId: "22",
      attackerTroops: 3,
      defenderTroops: 1,
    };
  }

  getSetup(playerId) {
    const opponents = this.#players.filter(({ id }) => id !== playerId);
    const opponentsDetails = {};

    for (const { id, ...details } of opponents) {
      opponentsDetails[id] = { ...details, id };
    }
    const currentPlayerDetails = this.#players.find(
      ({ id }) => id === playerId,
    );

    return {
      continents: this.#continents,
      territories: this.#territory,
      player: { ...currentPlayerDetails },
      opponents: opponentsDetails,
      cards: [],
      currentPlayer: this.#activePlayerId,
      state: this.#state,
    };
  }

  #shuffleTerritories(territories) {
    return territories.sort(() => this.#randomFunction() - 0.5);
  }

  #initTerritory() {
    this.#players.forEach((player) => {
      player["territories"] = [];
    });
  }

  initTerritories() {
    const territoryIds = this.#shuffleTerritories(Object.keys(this.#territory));
    this.#initTerritory();
    // this.#assignTerritories(territoryIds);
    territoryIds.forEach((territoryId, playerIndex) => {
      const territory = this.#territory[territoryId];
      territory.troopCount = 1;
      const player = this.#players[playerIndex % this.#players.length];
      player.territories.push(Number(territoryId));
    });

    this.#state = STATES.INITIAL_REINFORCEMENT;
    this.#stateDetails.remainingTroopsToDeploy = 13;

    return { players: this.#players, territories: this.#territory };
  }

  initialReinforcement(territoryId, troopCount) {
    const territory = this.#territory[territoryId];

    if (troopCount !== 1) {
      return {
        action: this.#state,
        data: { territoryId, newTroopCount: territory.troopCount },
      };
    }

    territory.troopCount++;
    this.#stateDetails.remainingTroopsToDeploy--;

    if (this.#stateDetails.remainingTroopsToDeploy <= 0) {
      this.#state = STATES.REINFORCE;
    }

    return {
      action: this.#state,
      data: {
        territoryId,
        newTroopCount: territory.troopCount,
        remainingTroops: this.#stateDetails.remainingTroopsToDeploy,
      },
    };
  }

  reinforce({ territoryId, troopCount }) {
    const territory = this.#territory[territoryId];

    if (this.#isValidTroopCount(troopCount)) {
      return {
        action: this.#state,
        data: {
          territoryId,
          newTroopCount: territory.troopCount,
          remainingTroops: this.#stateDetails.remainingTroopsToDeploy,
        },
      };
    }

    if (this.#state === STATES.INITIAL_REINFORCEMENT) {
      return this.initialReinforcement(territoryId, troopCount);
    }

    territory.troopCount += troopCount;
    this.#stateDetails.remainingTroopsToDeploy -= troopCount;

    if (this.#stateDetails.remainingTroopsToDeploy <= 0) {
      this.#state = STATES.INVASION;
    }

    return {
      action: this.#state,
      data: {
        territoryId,
        newTroopCount: territory.troopCount,
        remainingTroops: this.#stateDetails.remainingTroopsToDeploy,
      },
    };
  }

  #isValidTroopCount(troopCount) {
    return (
      !troopCount ||
      troopCount <= 0 ||
      troopCount > this.#stateDetails.remainingTroopsToDeploy
    );
  }

  #setReinforcements() {
    this.#stateDetails.remainingTroopsToDeploy = 3;
  }

  setupNextPhase() {
    if (this.#state === STATES.REINFORCE) {
      this.#setReinforcements();
      return {
        action: this.#state,
        data: { troopsToReinforce: this.#stateDetails.remainingTroopsToDeploy },
      };
    }
  }

  #isValidAttacker({ attackerTerritoryId }) {
    const player = this.#players.find(({ id }) => id === this.#activePlayerId);
    return player.territories.includes(attackerTerritoryId);
  }

  #validDefender({ attackerTerritoryId, defenderTerritoryId }) {
    const neighbours = this.#territory[attackerTerritoryId].neighbours;

    const isNeighbour = neighbours.includes(defenderTerritoryId);
    const player = this.#players.find(({ id }) => id === this.#activePlayerId);
    const isEnemy = !player.territories.includes(defenderTerritoryId);
    return isNeighbour && isEnemy;
  }

  #isValidAttackerTroopsCount({ attackerTerritoryId, attackerTroops }) {
    const availableTroopCount = this.#territory[attackerTerritoryId].troopCount;
    const isInRange = attackerTroops <= 3 && attackerTroops > 0;

    return availableTroopCount > attackerTroops && isInRange;
  }

  invade(invadeDetials) {
    const isValidAttack = this.#isValidAttacker(invadeDetials) &&
      this.#validDefender(invadeDetials) &&
      this.#isValidAttackerTroopsCount(invadeDetials);

    if (!isValidAttack) {
      throw new Error("Invalid Attack");
    }

    this.#state = STATES.DEFEND;
    this.#stateDetails = invadeDetials;
    return { action: this.#state, data: {} };
  }

  defend(data) {
    this.#state = STATES.RESOLVE_COMBAT;
    this.#stateDetails["defenderTroops"] = data.troopCount;

    const {
      attackerTerritoryId,
      defenderTerritoryId,
      attackerTroops,
      defenderTroops,
    } = this.#stateDetails;

    return {
      action: this.#state,
      data: {
        attackerTerritoryId,
        defenderTerritoryId,
        attackerTroops,
        defenderTroops,
      },
    };
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

  #updateTroopCount(attackerTerritoryId, defenderTerritoryId, combatResult) {
    const attackerTerritory = this.#territory[attackerTerritoryId];
    const defenderTerritory = this.#territory[defenderTerritoryId];
    attackerTerritory.troopCount -= combatResult.attackerLoss;
    defenderTerritory.troopCount -= combatResult.defenderLoss;

    return {
      attackerTroops: attackerTerritory.troopCount,
      defenderTroops: defenderTerritory.troopCount,
    };
  }

  #constructCombatMsg(combatResult) {
    return combatResult.attackerLoss < combatResult.defenderLoss
      ? "Attack successful"
      : "Attack failed";
  }

  resolveCombat() {
    const { attackerTerritoryId, defenderTerritoryId } = this.#stateDetails;
    const attackerDice = this.#rollDice(this.#stateDetails.attackerTroops);
    const defenderDice = this.#rollDice(this.#stateDetails.defenderTroops);
    const combatResult = this.#calculateLoss(defenderDice, attackerDice);
    const msg = this.#constructCombatMsg(combatResult);
    const updatedTroops = this.#updateTroopCount(
      attackerTerritoryId,
      defenderTerritoryId,
      combatResult,
    );
    this.#state = STATES.REINFORCE;

    return {
      action: this.#state,
      data: { attackerDice, defenderDice, msg, ...updatedTroops },
    };
  }

  getSavableGameState() {
    return {
      activePlayerId: this.#activePlayerId,
      territory: this.#territory,
      players: this.#players,
      continents: this.#continents,
      state: this.#state,
      stateDetails: this.#stateDetails,
    };
  }

  loadGameState(gameState) {
    const {
      activePlayerId,
      territory,
      players,
      continents,
      state,
      stateDetails,
    } = gameState;
    this.#activePlayerId = activePlayerId;
    this.#territory = territory;
    this.#players = players;
    this.#continents = continents;
    this.#state = state;
    this.#stateDetails = stateDetails;
  }
}
