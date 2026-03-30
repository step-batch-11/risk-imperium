import { CONFIG } from "./config.js";
import { mockPlayers } from "./dummy_data.js";

export class Game {
  #activePlayerId;
  #territory;
  #players;
  #continents;

  constructor(
    players = mockPlayers,
    territories = CONFIG.TERRITORIES,
    continents = CONFIG.CONTINENTS,
  ) {
    this.#activePlayerId = players[0].id;
    this.#territory = territories;
    this.#players = players;
    this.#continents = continents;
  }

  getSetup(playerId) {
    const opponents = this.#players.filter(({ id }) => id !== playerId);
    const opponentsDetails = {};

    for (const { id, ...details } of opponents) {
      opponentsDetails[id] = { ...details };
    }

    return {
      continents: this.#continents,
      territories: this.#territory,
      player: this.#players.find(({ id }) => id === playerId),
      opponents: opponentsDetails,
      cards: [],
      currentPlayer: this.#activePlayerId,
    };
  }
}
