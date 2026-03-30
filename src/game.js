import { CONFIG, STATES } from "./config.js";
import { mockPlayers } from "./dummy_data.js";

export class Game {
  #activePlayerId;
  #territory;
  #players;
  #continents;
  #state;

  constructor(
    players = mockPlayers,
    territories = CONFIG.TERRITORIES,
    continents = CONFIG.CONTINENTS,
  ) {
    this.#activePlayerId = players[0].id;
    this.#territory = territories;
    this.#players = players;
    this.#continents = continents;
    this.#state = STATES.WAITING;
  }

  getSetup(playerId) {
    const opponents = this.#players.filter(({ id }) => id !== playerId);
    const opponentsDetails = {};

    for (const { id, ...details } of opponents) {
      opponentsDetails[id] = { ...details, territories: [] };
    }
    const currentPlayerDetials = this.#players.find(({ id }) =>
      id === playerId
    );

    return {
      continents: this.#continents,
      territories: this.#territory,
      player: { ...currentPlayerDetials, territories: [] },
      opponents: opponentsDetails,
      cards: [],
      currentPlayer: this.#activePlayerId,
      state: this.#state,
    };
  }

  #shuffleTerritories(territories) {
    return territories.sort(() => Math.random() - 0.5);
  }

  initTerritories() {
    const territoryIds = this.#shuffleTerritories(Object.keys(this.#territory));
    let playerIndex = 0;

    territoryIds.forEach((territoryId) => {
      const territory = this.#territory[territoryId];
      territory.troopCount = 1;
      this.#players[playerIndex % this.#players.length].territories.push(
        territoryId,
      );
      playerIndex++;
    });

    this.#state = STATES.INITIAL_TERRITORY_ALLOCATION;
    return { players: this.#players, territories: this.#territory };
  }

  reinforce({ territoryId, troopCount }) {
    const territory = this.#territory[territoryId];
    territory.troopCount += troopCount;

    return {
      message: "Troops deployed successfully",
      data: { territoryId, newTroopCount: territory.troopCount },
    };
  }
}
