import { STATES } from "../config.js";

const captureTerritory = (game) => {
  game.decreaseTroops(
    game.stateDetails.attackerTerritoryId,
    game.stateDetails.attackerTroops,
  );

  game.setTroops(
    game.stateDetails.defenderTerritoryId,
    game.stateDetails.attackerTroops,
  );

  game.updateOwner(game.stateDetails.defenderTerritoryId, game.activePlayerId);
};

const handleCapture = (game) => {
  if (game.isTerritoryBarren(game.stateDetails.defenderTerritoryId)) {
    game.stateDetails.isCaptured = true;
    captureTerritory(game);
  }
};

const rollDice = (count, randomFunction = Math.random) => {
  return Array.from(
    { length: count },
    () => Math.ceil(randomFunction() * 6),
  ).sort((a, b) => b - a);
};

const calculateLoss = (defenderDice, attackerDice) => {
  const combatResult = { attackerLoss: 0, defenderLoss: 0 };
  const dicesCount = Math.min(defenderDice.length, attackerDice.length);
  for (let index = 0; index < dicesCount; index++) {
    attackerDice[index] <= defenderDice[index]
      ? combatResult.attackerLoss++
      : combatResult.defenderLoss++;
  }
  return combatResult;
};

const resolveCombat = (game) => {
  const attackerDice = rollDice(game.stateDetails.attackerTroops);
  const defenderDice = rollDice(game.stateDetails.defenderTroopCount);
  const { attackerLoss, defenderLoss } = calculateLoss(
    defenderDice,
    attackerDice,
  );
  const isAttackSuccessful = attackerLoss < defenderLoss;

  const attackerTerritoryId = game.stateDetails.attackerTerritoryId;
  const defenderTerritoryId = game.stateDetails.defenderTerritoryId;

  game.decreaseTroops(attackerTerritoryId, attackerLoss);
  game.decreaseTroops(defenderTerritoryId, defenderLoss);

  game.stateDetails.attackerDice = attackerDice;
  game.stateDetails.defenderDice = defenderDice;
  game.stateDetails.attackerLoss = attackerLoss;
  game.stateDetails.defenderLoss = defenderLoss;
  game.stateDetails.isAttackSuccessful = isAttackSuccessful;

  handleCapture(game);
  return [attackerTerritoryId, defenderTerritoryId];
};

export const resolveCombatService = (game) => {
  const { defenderTerritoryId } = game.stateDetails;
  const defenderId = game.getOwnerOfTerritory(defenderTerritoryId);

  const territoriesIds = resolveCombat(game);
  const { attackerDice, defenderDice } = game.stateDetails;
  const updatedTerritories = game.getTerritoriesDetails(...territoriesIds);
  const isCurrentCaptured = game.stateDetails.isCaptured;
  const isEliminated = game.isEliminated(defenderId);
  if (isEliminated) {
    game.eliminatePlayer(defenderId);
  }
  const isWon = game.hasPlayerWon();
  const currentGameState = isWon
    ? STATES.WON
    : isCurrentCaptured
    ? STATES.MOVE_IN
    : STATES.INVASION;

  game.setNewState(currentGameState);
  const notifyMsg = game.stateDetails.isAttackSuccessful
    ? { status: "success", msg: "Attack Successful" }
    : { status: "fail", msg: "Attack Unsuccessful" };

  game.hasCaptured = game.hasCaptured || isCurrentCaptured;
  game.updateGame(
    STATES.RESOLVE_COMBAT,
    {
      attackerId: game.activePlayerId,
      defenderId,
      attackerDice,
      defenderDice,
      notifyMsg,
      updatedTerritories,
      hasCaptured: isCurrentCaptured,
      hasEliminated: isEliminated,
      invadeDetails: game.stateDetails,
    },
    game.activePlayerId,
  );

  const userState = game.getGameState() === STATES.MOVE_IN
    ? STATES.MOVE_IN
    : game.getGameState();

  return {
    action: userState,
    data: {
      defenderId,
      attackerDice,
      defenderDice,
      notifyMsg,
      updatedTerritories,
      hasCaptured: isCurrentCaptured,
      hasEliminated: isEliminated,
      hasWon: isWon,
      newCards: game.activePlayer.cards,
      invadeDetails: game.stateDetails,
    },
  };
};
