import { CONFIG, STATES } from "./config.js";
import { mockPlayers } from "./dummy_data.js";

export class Game {
  #activePlayerId;
  #territory;
  #players;
  #continents;
  #state

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
    const currentPlayerDetials = this.#players.find(({ id }) => id === playerId)

    return {
      continents: this.#continents,
      territories: this.#territory,
      player: { ...currentPlayerDetials, territories: [] },
      opponents: opponentsDetails,
      cards: [],
      currentPlayer: this.#activePlayerId,
      state: this.#state
    };
  }
}
