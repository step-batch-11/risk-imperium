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
  #invasionController;
  #hasCaptured;
  #versionId;
  #lastUpdate;

  #round;
  #troops;
  #playersCount;

  constructor(
    players = mockPlayers(),
    handlers = {},
    controllers = {},
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

    this.#invasionController = controllers.invasionController;
    this.#versionId = 0;
    this.#lastUpdate = {};

    this.#round = 0;
    this.#troops = initTroops;
    this.#playersCount = players.length;

    this.stateDetails = { remainingTroopsCount: 0, hasCaptured: false };
    this.hasCaptured = false;
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

  get remainingTroop() {
    const deployedTroopsPerPlayer = this.#round / this.#playersCount;
    return this.#troops - Math.floor(deployedTroopsPerPlayer);
  }

  get activePlayerTerritory() {
    return this.#territories.getTerritoriesOf(this.#activePlayerId);
  }
  setTroops(territoryId, count) {
    return this.#territories.setTroops(territoryId, count);
  }

  moveCavalry() {
    this.#cavalry.moveCavalry();
  }

  get cavalryPositions() {
    return this.#cavalry.getPositions();
  }

  updateOwner(territoryId, ownerId) {
    this.#territories.updateOwner(territoryId, ownerId);
  }

  getAllTerritories() {
    return this.#territories.territories;
  }
  setNewState(state) {
    this.#state = state;
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
      throw ERROR_MESSAGE.INVALID_PARAMETERS;
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

  get #activePlayerId() {
    return this.#players[this.#activePlayerIndex].id;
  }

  #updateId() {
    this.#versionId++;
  }

  isTurnOf(id) {
    return this.#activePlayerId === id;
  }

  isLatestId(id) {
    return this.#versionId === id;
  }

  get lastUpdate() {
    return structuredClone(this.#lastUpdate);
  }

  get activePlayerId() {
    return this.#activePlayerId;
  }

  get activePlayer() {
    return this.#activePlayer;
  }

  get players() {
    return this.#players;
  }

  get #activePlayer() {
    return this.#players.find((player) => player.id === this.#activePlayerId);
  }

  get version() {
    return this.#versionId;
  }

  get invadeDetail() {
    return this.stateDetails;
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

  #changeTurn() {
    this.#activePlayerIndex = (this.#activePlayerIndex + 1) %
      this.#players.length;
    return this.#activePlayerIndex;
  }

  #updateState(state) {
    if (state in STATES) {
      this.#state = state;
    }
    return state;
  }

  #getDefenderCards(attacker, defender) {
    attacker.cards.push(...defender.cards);
  }

  #eliminatePlayer(defenderId) {
    const index = this.#players.findIndex((player) => player.id === defenderId);
    const defender = this.#players[index];
    const attacker = this.#activePlayer;
    this.#getDefenderCards(attacker, defender);
    this.#players.splice(index, 1);
    if (index < this.#activePlayerIndex) {
      this.#activePlayerIndex -= 1;
    }
  }
  #isEliminated(playerId) {
    const territoryCount = this.#territories.getTerritoriesOf(playerId).length;
    return territoryCount <= 0;
  }

  #isPlayerCards(cards) {
    const currentPlayer = this.#activePlayer;
    const playerCards = currentPlayer.cards;
    return cards.every((card) => playerCards.includes(card));
  }

  #hasPlayerWon() {
    return this.#territories.isConquered;
  }

  getGameState() {
    return this.#state;
  }

  skipFortification() {
    this.#updateState(STATES.GET_CARD);
    this.updateGame(STATES.SKIP_FORTIFICATION, {}, this.#activePlayerId);
  }

  moveTroops(from, to, count) {
    return this.#territories.moveTroops(from, to, count);
  }

  skipInvasion() {
    this.#updateState(STATES.FORTIFICATION);
    this.updateGame(STATES.SKIP_INVASION, {}, this.#activePlayerId);
  }

  #getOpponentsDetail(playerId) {
    return this.#players.reduce((opponents, player) => {
      if (player.id !== playerId) {
        const playerTerritories = this.#territories.getTerritoriesOf(
          player.id,
        );
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

  invade({ attackerTerritoryId, attackerTroops, defenderTerritoryId }) {
    try {
      this.#invasionController.setNewInvasion(
        this.#activePlayerId,
        attackerTerritoryId,
        defenderTerritoryId,
        attackerTroops,
      );
      const defenderId = this.#territories.getOwnerOf(defenderTerritoryId);

      this.updateGame(
        STATES.INVASION,
        {
          attackerId: this.#activePlayerId,
          defenderId,
          attackerTerritoryId,
          defenderTerritoryId,
          attackerTroops,
        },
        this.#activePlayerId,
      );

      this.#state = STATES.DEFEND;
      return { newState: STATES.WAITING, data: {} };
    } catch (e) {
      console.log(e);
      throw new Error("Invalid Attack");
    }
  }

  defend({ troopCount }) {
    const { defenderTerritoryId } = this.#invasionController.invadeDetails;
    const defenderId = this.#territories.getOwnerOf(defenderTerritoryId);
    try {
      this.#invasionController.setDefenderTroops(troopCount);
      this.updateGame(
        STATES.DEFEND,
        {
          attackerId: this.#activePlayerId,
          defenderId,
          defenderTroopCount: troopCount,
        },
        this.#activePlayerId,
      );

      this.#state = STATES.RESOLVE_COMBAT;
      return {
        action: STATES.WAITING,
        data: this.#invasionController.invadeDetails,
      };
    } catch (e) {
      console.log(e);
      return {
        action: STATES.DEFEND,
        data: this.#invasionController.invadeDetails,
      };
    }
  }

  resolveCombat() {
    const { defenderTerritoryId } = this.#invasionController.invadeDetails;
    const defenderId = this.#territories.getOwnerOf(defenderTerritoryId);
    const updatedTerritoriesIds = this.#invasionController.resolve();

    const { attackerDice, defenderDice } =
      this.#invasionController.invadeDetails;

    const updatedTerritories = this.#territories.getTerritoryAndTroopsCount(
      ...updatedTerritoriesIds,
    );

    const isCurrentCaptured = this.#invasionController.isCaptured;
    const isEliminated = this.#isEliminated(defenderId);

    if (isEliminated) {
      this.#eliminatePlayer(defenderId);
    }

    const isWon = this.#hasPlayerWon();

    this.#state = isWon
      ? STATES.WON
      : isCurrentCaptured
      ? STATES.MOVE_IN
      : STATES.INVASION;

    const notifyMsg = this.#invasionController.isAttackSuccessful
      ? { status: "success", msg: "Attack Successful" }
      : { status: "fail", msg: "Attack Unsuccessful" };

    this.#hasCaptured = this.#hasCaptured || isCurrentCaptured;

    this.updateGame(
      STATES.RESOLVE_COMBAT,
      {
        attackerId: this.#activePlayerId,
        defenderId,
        attackerDice,
        defenderDice,
        notifyMsg,
        updatedTerritories,
        hasCaptured: isCurrentCaptured,
        hasEliminated: isEliminated,
        invadeDetails: this.#invasionController.invadeDetails,
      },
      this.#activePlayerId,
    );

    return {
      action: this.#state,
      data: {
        defenderId,
        attackerDice,
        defenderDice,
        notifyMsg,
        updatedTerritories,
        hasCaptured: isCurrentCaptured,
        hasEliminated: isEliminated,
        hasWon: isWon,
        newCards: this.#activePlayer.cards,
        invadeDetails: this.#invasionController.invadeDetails,
      },
    };
  }
  get canGetCard() {
    return this.#hasCaptured;
  }

  moveIn(troopCount) {
    const updatedTerritoriesId = this.#invasionController.moveIn(troopCount);

    const { defenderId, attackerTerritoryId, defenderTerritoryId } =
      this.#invasionController.invadeDetails;

    const hasEliminated = this.#isEliminated(defenderId);

    const updatedTerritories = this.#territories.getTerritoryAndTroopsCount(
      ...updatedTerritoriesId,
    );

    this.updateGame(
      STATES.MOVE_IN,
      {
        from: attackerTerritoryId,
        to: defenderTerritoryId,
        troopCount,
      },
      this.#activePlayerId,
    );

    this.#state = STATES.INVASION;

    return {
      action: this.#state,
      data: {
        updatedTerritories,
        hasEliminated,
        hasWon: this.#hasPlayerWon(),
        newCards: this.#activePlayer.cards,
      },
    };
  }

  passToNextPlayer() {
    this.#state = STATES.REINFORCE;
    this.#changeTurn();
    this.#updateId();
  }

  getCard() {
    return this.#cards.drawCard();
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
    return this.#isPlayerCards(cards);
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
      invasion: this.#invasionController.saveableState(),
      cavalry: this.#cavalry.lastPos,
      hasCaptured: this.#hasCaptured,

      round: this.#round,
      troops: this.#troops,
      playersCount: this.#playersCount,

      stateDetails: this.stateDetails,
    };
  }

  loadGameState(gameState, handlers = {}, controller = {}) {
    const { players, state, activePlayerIndex } = gameState;

    this.#invasionController = controller.invasionController;

    this.#invasionController.loadState(gameState.invasion);

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
