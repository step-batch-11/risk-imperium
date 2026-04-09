import { STATES } from "./config.js";

import { mockPlayers } from "./mock_data.js";

export class Game {
  #activePlayerIndex;
  #territories;
  #players;
  #continentsHandler;
  #state;
  #randomFunction;
  #cards;
  #fortificationController;
  #cavalry;
  #territoriesHandler;
  #initialReinforcementController;
  #reinforcementController;
  #invasionController;
  #hasCaptured;
  #versionId;
  #lastUpdate;

  constructor(
    players = mockPlayers(),
    handlers = {},
    controllers = {},
    utilities = {},
  ) {
    this.#randomFunction = utilities.random;
    this.#activePlayerIndex = 0;

    this.#territoriesHandler = handlers.territoriesHandler;
    this.#players = players;
    this.#cards = handlers.cardsHandler;
    this.#continentsHandler = handlers.continentsHandler;
    this.#cavalry = handlers.cavalry;
    this.#state = STATES.SETUP;
    this.#hasCaptured = false;
    this.#fortificationController = controllers.fortificationController;

    this.#initialReinforcementController =
      controllers.initialReinforcementController;
    this.#reinforcementController = controllers.reinforcementController;
    this.#invasionController = controllers.invasionController;
    this.#versionId = 0;
    this.#lastUpdate = {};
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
    return this.#invasionController.invadeDetails;
  }

  isPlayerDefending(playerId) {
    if (this.#state !== STATES.DEFEND) {
      return false;
    }
    const defenderTerritoryId =
      this.#invasionController.invadeDetails.defenderTerritoryId;
    const defenderId = this.#territoriesHandler.getOwnerOf(defenderTerritoryId);

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

  #setReinforcementsIfNotExists() {
    if (this.#reinforcementController.isDone) {
      this.#reinforcementController.setToReinforce(this.#activePlayerId);
    }
  }

  #getPlayerByTerritoryId(territoryId) {
    const playerId = this.#territoriesHandler.getOwnerOf(territoryId);
    return this.#players.find((player) => playerId === player.id);
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
    const territoryCount =
      this.#territoriesHandler.getTerritoriesOf(playerId).length;

    return territoryCount <= 0;
  }

  #isPlayerCards(cards) {
    const currentPlayer = this.#activePlayer;
    const playerCards = currentPlayer.cards;
    return cards.every((card) => playerCards.includes(card));
  }

  #hasPlayerWon() {
    return this.#territoriesHandler.isConquered;
  }

  getGameState() {
    return this.#state;
  }

  skipFortification() {
    this.#updateState(STATES.GET_CARD);
    this.updateGame(STATES.SKIP_FORTIFICATION, {}, this.#activePlayerId);
  }

  fortification(from, to, count) {
    try {
      const playerTerritories = this.#territoriesHandler.getTerritoriesOf(
        this.#activePlayerId,
      );

      this.#fortificationController.moveTroops(
        from,
        to,
        count,
        playerTerritories,
      );

      const updatedTerritories = this.#territoriesHandler.moveTroops(
        from,
        to,
        count,
      );
      this.updateGame(
        STATES.FORTIFICATION,
        {
          from,
          to,
          troopCount: count,
        },
        this.#activePlayerId,
      );

      this.#updateState(STATES.GET_CARD);

      return updatedTerritories;
    } catch {
      return [];
    }
  }

  skipInvasion() {
    this.#updateState(STATES.FORTIFICATION);
    this.updateGame(STATES.SKIP_INVASION, {}, this.#activePlayerId);
  }

  #getOpponentsDetail(playerId) {
    return this.#players.reduce((opponents, player) => {
      if (player.id !== playerId) {
        const playerTerritories = this.#territoriesHandler.getTerritoriesOf(
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
        territories: this.#territoriesHandler.getTerritories(),
        opponents: this.#getOpponentsDetail(-1),
        player: { territories: [] },
      };
    }
    const opponents = this.#getOpponentsDetail(playerId);

    const currentPlayer = this.#players.find(({ id }) => id === playerId);

    const cards = currentPlayer.cards;
    const basicDetails = currentPlayer.getBasicDetails();

    const territories = this.#territoriesHandler.getTerritoriesOf(playerId);
    const currentPlayerDetails = { ...basicDetails, territories, cards };
    const playerState = this.isTurnOf(playerId) ? this.#state : STATES.WAITING;
    return {
      continents: this.#continentsHandler.getContinents(),
      territories: this.#territoriesHandler.getTerritories(),
      player: currentPlayerDetails,
      opponents: opponents,
      currentPlayer: this.#activePlayerId,
      cavalryPositions: this.#cavalry.getPositions(),
      state: playerState,
    };
  }

  initTerritories() {
    this.#territoriesHandler.setInitTroops();
    this.#territoriesHandler.assignRandomTerritories(
      this.#players.map((player) => player.id),
      this.#randomFunction,
    );
    this.#state = STATES.INITIAL_REINFORCEMENT;
    this.#updateId();

    return {
      players: this.#players,
      territories: this.#territoriesHandler.territories,
    };
  }

  initialReinforcement(territoryId) {
    const troopsLeft = this.#initialReinforcementController.addOne(territoryId);

    const data = {
      updatedTerritory: this.#territoriesHandler.getTerritoryAndTroopsCount(
        territoryId,
      ),
      remainingTroops: troopsLeft,
    };

    this.updateGame(STATES.INITIAL_REINFORCEMENT, data, this.#activePlayerId);
    this.#changeTurn();

    if (this.#initialReinforcementController.isDone) {
      this.#updateState(STATES.REINFORCE);
    }

    return {
      action: STATES.WAITING,
      data: { ...data, currentPlayerId: this.#activePlayerId },
    };
  }

  reinforce({ territoryId, troopCount }) {
    if (this.#state === STATES.INITIAL_REINFORCEMENT) {
      return this.initialReinforcement(territoryId, troopCount);
    }

    try {
      const remainingTroopToDeploy = this.#reinforcementController.reinforce(
        territoryId,
        troopCount,
      );

      this.updateGame(
        STATES.REINFORCE,
        {
          territoryId,
          troopCount,
        },
        this.#activePlayerId,
      );

      if (this.#reinforcementController.isDone) {
        this.#state = STATES.INVASION;
      }

      return {
        action: this.#state,
        data: {
          updatedTerritory: this.#territoriesHandler.getTerritoryAndTroopsCount(
            territoryId,
          ),
          remainingTroops: remainingTroopToDeploy,
          currentPlayerId: this.#activePlayerId,
        },
      };
    } catch {
      return {
        action: this.#state,
        data: {
          updatedTerritory: this.#territoriesHandler.getTerritoryAndTroopsCount(
            territoryId,
          ),
          remainingTroops: 0,
          currentPlayerId: this.#activePlayerId,
        },
      };
    }
  }

  setupNextPhase() {
    if (this.#state === STATES.INITIAL_REINFORCEMENT) {
      const troopsToReinforce =
        this.#initialReinforcementController.remainingTroop;
      return {
        action: this.#state,
        data: { troopsToReinforce },
      };
    }

    if (this.#state === STATES.REINFORCE) {
      this.#setReinforcementsIfNotExists();
      return {
        action: this.#state,
        data: { troopsToReinforce: this.#reinforcementController.remaining },
      };
    }
  }

  invade({ attackerTerritoryId, attackerTroops, defenderTerritoryId }) {
    try {
      this.#invasionController.setNewInvasion(
        this.#activePlayerId,
        attackerTerritoryId,
        defenderTerritoryId,
        attackerTroops,
      );
      const defenderId = this.#territoriesHandler.getOwnerOf(
        defenderTerritoryId,
      );

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
    } catch {
      throw new Error("Invalid Attack");
    }
  }

  defend({ troopCount }) {
    const { defenderTerritoryId } = this.#invasionController.invadeDetails;
    const defenderId = this.#territoriesHandler.getOwnerOf(defenderTerritoryId);
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
    } catch {
      return {
        action: STATES.DEFEND,
        data: this.#invasionController.invadeDetails,
      };
    }
  }

  resolveCombat() {
    const { defenderTerritoryId } = this.#invasionController.invadeDetails;
    const defenderId = this.#territoriesHandler.getOwnerOf(defenderTerritoryId);
    const updatedTerritoriesIds = this.#invasionController.resolve();

    const { attackerDice, defenderDice } =
      this.#invasionController.invadeDetails;

    const updatedTerritories = this.#territoriesHandler
      .getTerritoryAndTroopsCount(
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

    const { defenderTerritoryId, attackerTerritoryId } =
      this.#invasionController.invadeDetails;
    const defenderId = this.#territoriesHandler.getOwnerOf(defenderTerritoryId);

    const hasEliminated = this.#isEliminated(defenderId);
    const updatedTerritories = this.#territoriesHandler
      .getTerritoryAndTroopsCount(
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
    this.#state = STATES.REINFORCE;

    const card = this.#cards.drawCard();
    const activePlayer = this.#activePlayer;
    activePlayer.cards.push(card);
    this.#hasCaptured = false;

    this.updateGame(
      STATES.GET_CARD,
      { playerId: this.#activePlayerId },
      this.#activePlayerId,
    );

    return card;
  }

  removePlayerCards(cards) {
    const currentPlayer = this.#activePlayer;
    const playerCards = currentPlayer.cards;
    for (const card in cards) {
      const idx = playerCards.findIndex((c) => c === card);
      playerCards.splice(idx, 1);
    }
  }

  tradeCard(cards) {
    const isValidCombo = this.#cards.isValidCombination(cards);
    const isPlayerCards = this.#isPlayerCards(cards);

    if (!isValidCombo || !isPlayerCards) {
      throw new Error("INVALID CARDS COMBO");
    }
    this.#state = STATES.REINFORCE;
    const troops = this.#cavalry.getCurrentCount();

    this.#reinforcementController.addExtraTroops(troops);

    const remainingTroopsToDeploy = this.#reinforcementController.remaining;
    this.removePlayerCards(cards);
    this.#cavalry.moveCavalry();
    const positions = this.#cavalry.getPositions();

    this.updateGame(
      STATES.TRADE_CARD,
      {
        playerId: this.#activePlayerId,
        cavalryPositions: positions,
        troopsLeft: remainingTroopsToDeploy,
      },
      this.#activePlayerId,
    );

    return { troops: remainingTroopsToDeploy, positions };
  }

  isCurrentUserTerritory(territoryId) {
    return this.#territoriesHandler.isTerritoryOwnBy(
      territoryId,
      this.#activePlayerId,
    );
  }

  getSavableGameState() {
    return {
      activePlayerIndex: this.#activePlayerIndex,
      activePlayerId: this.#activePlayerId,
      territories: this.#territoriesHandler.getTerritories(),
      players: this.#players.map((player) => player.getSaveableData()),
      continents: this.#continentsHandler.getContinents(),
      state: this.#state,
      initReinforce: this.#initialReinforcementController.saveableState(),
      reinforce: this.#reinforcementController.saveableState(),
      invasion: this.#invasionController.saveableState(),
      cavalry: this.#cavalry.lastPos,
      hasCaptured: this.#hasCaptured,
    };
  }

  loadGameState(gameState, handlers = {}, controller = {}) {
    const { players, state, activePlayerIndex } = gameState;

    for (let index = 0; index < players.length; index++) {
      const player = this.#players[index];
      const playerCards = players[index].cards;
      player.loadSaveGame(playerCards);
    }

    this.#invasionController = controller.invasionController;

    this.#invasionController.loadState(gameState.invasion);

    this.#reinforcementController = controller.reinforcementController;
    this.#reinforcementController.loadState(gameState.reinforce);

    this.#initialReinforcementController =
      controller.initialReinforcementController;
    this.#initialReinforcementController.loadGameState(gameState.initReinforce);

    this.#activePlayerIndex = activePlayerIndex;
    this.#territoriesHandler = handlers.territoriesHandler;

    this.#state = state;
    this.#cavalry = handlers.cavalry;
    this.#cards = handlers.cardsHandler;
    this.#hasCaptured = gameState.hasCaptured;
    this.#fortificationController = handlers.fortificationHandler;
  }
}
