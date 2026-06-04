import { STATES } from "./config.js";
import { ERROR_MESSAGE } from "./config/error_message.js";

import { mockPlayers } from "./mock_data.js";

export class Game {
  #activePlayerIndex;
  #players;
  #continents;
  #state;
  #randomFunction;
  #cards;
  #cavalry;
  #territories;

  #hasCaptured;
  #versionId;
  #lastUpdate;

  #round;
  #troops;
  #playersCount;

  constructor(
    players = mockPlayers(),
    handlers = {},
    utilities = {},
    initTroops = 2,
  ) {
    this.#randomFunction = utilities.random;
    this.#activePlayerIndex = 0;

    this.#territories = handlers.territoriesHandler;
    this.#players = players;
    this.#cards = handlers.cardsHandler;
    this.#continents = handlers.continentsHandler;
    this.#cavalry = handlers.cavalry;
    this.#state = STATES.SETUP;
    this.#hasCaptured = false;
    this.#versionId = 0;
    this.#lastUpdate = {};

    this.#round = 0;
    this.#troops = initTroops;
    this.#playersCount = players.length;

    this.stateDetails = { remainingTroopsCount: 0, hasCaptured: false };
    this.hasCaptured = false;
  }

  get #activePlayerId() {
    return this.#players[this.#activePlayerIndex].id;
  }

  get #activePlayer() {
    return this.#players[this.#activePlayerIndex];
    // return this.#players.find((player) => player.id === this.#activePlayerId);
  }

  get activePlayerId() {
    return this.#activePlayerId;
  }

  get activePlayer() {
    return this.#activePlayer;
  }

  get remainingTroop() {
    const deployedTroopsPerPlayer = this.#round / this.#playersCount;
    return this.#troops - Math.floor(deployedTroopsPerPlayer);
  }

  get activePlayerTerritory() {
    return this.#territories.getTerritoriesOf(this.#activePlayerId);
  }

  get cavalryPositions() {
    return this.#cavalry.getPositions();
  }

  get lastUpdate() {
    return structuredClone(this.#lastUpdate);
  }

  get players() {
    return this.#players;
  }

  get version() {
    return this.#versionId;
  }

  get invadeDetail() {
    return this.stateDetails;
  }

  get canGetCard() {
    return this.#hasCaptured;
  }

  #updateId() {
    this.#versionId++;
  }

  #changeTurn() {
    this.#activePlayerIndex = (this.#activePlayerIndex + 1) %
      this.#players.length;
    return this.#activePlayerIndex;
  }

  #updateState(state) {
    if (!(state in STATES)) {
      throw new Error(ERROR_MESSAGE.INVALID_STATE);
    }
    this.#state = state;
    return state;
  }

  #getDefenderCards(attacker, defender) {
    attacker.cards.push(...defender.cards);
  }

  dropOneTroop(territoryId) {
    this.#territories.addTroops(territoryId, 1);
    this.#round++;

    const deployedTroopsPerPlayer = this.#round / this.#playersCount;
    const isDone = deployedTroopsPerPlayer === this.#troops;
    if (isDone) {
      this.#updateState(STATES.REINFORCE);
    }

    return this.#troops - Math.ceil(deployedTroopsPerPlayer);
  }

  resetStateDetails() {
    const isCaptured = this.stateDetails.hasCaptured;
    const remainingTroops = this.stateDetails.remainingTroops;
    const remainingTroopsCount = this.stateDetails.remainingTroopsCount;
    this.stateDetails = {
      isCaptured,
      remainingTroops,
      remainingTroopsCount,
    };
  }

  setTroops(territoryId, count) {
    return this.#territories.setTroops(territoryId, count);
  }

  addCardToPlayerHand(card) {
    const player = this.#activePlayer;
    player.cards.push(card);
  }

  moveCavalry() {
    this.#cavalry.moveCavalry();
  }

  updateOwner(territoryId, ownerId) {
    this.#territories.updateOwner(territoryId, ownerId);
  }

  getAllTerritories() {
    return this.#territories.territories;
  }
  setNewState(state) {
    this.#updateState(state);
    return state;
  }

  isTerritoryBarren(territoryId) {
    return this.#territories.isBarren(territoryId);
  }

  addTroops(territoryId, troopCount) {
    this.#territories.addTroops(territoryId, troopCount);
  }

  decreaseTroops(territoryId, troopCount) {
    this.#territories.decreaseTroops(territoryId, troopCount);
  }

  getTerritoriesDetails(...territoryIds) {
    return this.#territories.getTerritoryAndTroopsCount(...territoryIds);
  }

  getPlayerTerritory(playerId) {
    if (!playerId) {
      throw new Error(ERROR_MESSAGE.INVALID_PARAMETERS);
    }

    return this.#territories.getTerritoriesOf(playerId);
  }

  getOwnerOfTerritory(territoryId) {
    return this.#territories.getOwnerOf(territoryId);
  }

  updateRemainingTroopCount(troopCount) {
    this.stateDetails.remainingTroopsCount = troopCount;
  }

  addReinforcementTroops(troopCount) {
    this.stateDetails.remainingTroopsCount ||= 0;
    this.stateDetails.remainingTroopsCount += troopCount;
  }

  isTerritoryOwnBy(territoryId, ownerId) {
    return this.#territories.isTerritoryOwnBy(territoryId, ownerId);
  }

  troopCountAtTerritory(territoryId) {
    return this.#territories.getTroopsCount(territoryId);
  }

  isNeighbouringTerritory(territoryId1, territoryId2) {
    const neighbours = this.#territories.getNeighbours(territoryId1);

    return neighbours.includes(territoryId2);
  }

  isEliminated(playerId) {
    const territoryCount = this.#territories.getTerritoriesOf(playerId).length;
    return territoryCount <= 0;
  }

  eliminatePlayer(defenderId) {
    const index = this.#players.findIndex((player) => player.id === defenderId);
    const defender = this.#players[index];
    const attacker = this.#activePlayer;
    this.#getDefenderCards(attacker, defender);
    this.#players.splice(index, 1);
    if (index < this.#activePlayerIndex) {
      this.#activePlayerIndex -= 1;
    }
  }

  hasPlayerWon() {
    return this.#territories.isConquered;
  }

  changeTurn() {
    this.#changeTurn();
  }

  isTurnOf(id) {
    return this.#activePlayerId === id;
  }

  isLatestId(id) {
    return this.#versionId === id;
  }

  isPlayerDefending(playerId) {
    if (this.#state !== STATES.DEFEND) {
      return false;
    }
    const defenderTerritoryId = this.stateDetails.defenderTerritoryId;
    const defenderId = this.#territories.getOwnerOf(defenderTerritoryId);
    return defenderId === playerId;
  }

  getUpdates(_id, playerId) {
    return this.getSetup(playerId);
  }

  updateGame(action, data, playerId) {
    this.#lastUpdate = { action, data, playerId };
    this.#updateId();
  }

  getGameState() {
    return this.#state;
  }

  moveTroops(from, to, count) {
    return this.#territories.moveTroops(from, to, count);
  }

  #getOpponentsDetail(playerId) {
    return this.#players.reduce((opponents, player) => {
      if (player.id !== playerId) {
        const playerTerritories = this.#territories.getTerritoriesOf(player.id);
        const playerBasicDetails = player.getBasicDetails();
        const opponentDetails = {
          ...playerBasicDetails,
          territories: playerTerritories,
        };
        opponents[player.id] = opponentDetails;
      }
      return opponents;
    }, {});
  }

  getSetup(playerId) {
    if (!playerId) {
      return {
        territories: this.#territories.getTerritories(),
        opponents: this.#getOpponentsDetail(-1),
        player: { territories: [] },
      };
    }

    const opponents = this.#getOpponentsDetail(playerId);

    const currentPlayer = this.#players.find(({ id }) => id === playerId);

    const cards = currentPlayer.cards;
    const basicDetails = currentPlayer.getBasicDetails();

    const territories = this.#territories.getTerritoriesOf(playerId);
    const currentPlayerDetails = { ...basicDetails, territories, cards };
    const playerState = this.isTurnOf(playerId) ? this.#state : STATES.WAITING;
    return {
      continents: this.#continents.getContinents(),
      territories: this.#territories.getTerritories(),
      player: currentPlayerDetails,
      opponents: opponents,
      currentPlayer: this.#activePlayerId,
      cavalryPositions: this.#cavalry.getPositions(),
      state: playerState,
    };
  }

  initTerritories() {
    this.#territories.setInitTroops();
    this.#territories.assignRandomTerritories(
      this.#players.map((player) => player.id),
      this.#randomFunction,
    );
    this.#state = STATES.INITIAL_REINFORCEMENT;
    this.#updateId();

    return {
      players: this.#players,
      territories: this.#territories.territories,
    };
  }

  passToNextPlayer() {
    this.#state = STATES.REINFORCE;
    this.#changeTurn();
    this.#updateId();
  }

  getCard(randomFn = Math.random) {
    return this.#cards.drawCard(randomFn);
  }

  removePlayerCards(cards) {
    const currentPlayer = this.#activePlayer;
    const playerCards = currentPlayer.cards;
    for (const card in cards) {
      const idx = playerCards.findIndex((c) => c === card);
      playerCards.splice(idx, 1);
    }
  }

  isValidCombination(cards) {
    return this.#cards.isValidCombination(cards);
  }

  isPlayerCards(cards) {
    const currentPlayer = this.#activePlayer;
    const playerCards = currentPlayer.cards;
    return cards.every((card) => playerCards.includes(card));
  }

  getCavalryTroops() {
    return this.#cavalry.getCurrentCount();
  }

  isCurrentUserTerritory(territoryId) {
    return this.#territories.isTerritoryOwnBy(
      territoryId,
      this.#activePlayerId,
    );
  }

  getSavableGameState() {
    return {
      activePlayerIndex: this.#activePlayerIndex,
      activePlayerId: this.#activePlayerId,
      territories: this.#territories.getTerritories(),
      players: this.#players.map((player) => player.getSaveableData()),
      continents: this.#continents.getContinents(),
      state: this.#state,
      cavalry: this.#cavalry.lastPos,
      hasCaptured: this.#hasCaptured,

      round: this.#round,
      troops: this.#troops,
      playersCount: this.#playersCount,

      stateDetails: this.stateDetails,
    };
  }

  loadGameState(gameState, handlers = {}) {
    const { players, state, activePlayerIndex } = gameState;

    this.#activePlayerIndex = activePlayerIndex;
    this.#territories = handlers.territoriesHandler;

    this.#state = state;
    this.#cavalry = handlers.cavalry;
    this.#cards = handlers.cardsHandler;
    this.#hasCaptured = gameState.hasCaptured;
    this.#round = gameState.round;
    this.#troops = gameState.troops;
    this.#playersCount = gameState.playersCount;
    this.stateDetails = gameState.stateDetails;

    for (let index = 0; index < players.length; index++) {
      const player = this.#players[index];
      const previousPlayer = players[index];
      const playerCards = previousPlayer.cards;
      player.loadSaveGame(playerCards);

      this.#territories.updateOwnerId(previousPlayer.id, player.id);
    }
  }
}
