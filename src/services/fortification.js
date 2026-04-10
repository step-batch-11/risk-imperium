import { STATES } from "../config.js";
import { ERROR_MESSAGE } from "../config/error_message.js";

export const continuousNeighbour = (
  territories,
  currentTerritory,
  owned,
  covered,
) => {
  const set = [];
  for (const territoryId of currentTerritory.neighbours) {
    if (owned.includes(territoryId) && !covered.includes(territoryId)) {
      covered.push(territoryId);
      set.push(territoryId);
      const newTer = territories[territoryId];
      set.push(...continuousNeighbour(territories, newTer, owned, covered));
    }
  }
  return set;
};

const findTerritory = (territories, ownedTerritories) => {
  const sets = [];
  const covered = [];
  for (const singleTerritoryId of ownedTerritories) {
    if (
      !covered.includes(singleTerritoryId) &&
      ownedTerritories.includes(singleTerritoryId)
    ) {
      covered.push(singleTerritoryId);
      const ter = territories[singleTerritoryId];
      const set = continuousNeighbour(
        territories,
        ter,
        ownedTerritories,
        covered,
      );
      sets.push([singleTerritoryId, ...set]);
    }
  }

  return sets.filter(
    (each) => each.length > 1 && each.some((t) => territories[t].troopCount),
  );
};

export const validateTerritory = (
  territories,
  playerTerritories,
  from,
  to,
  troopCount,
) => {
  const territoriesSets = findTerritory(
    territories,
    playerTerritories,
  );
  const territorySetWithFromLocation = territoriesSets.find((set) =>
    set.includes(from)
  );

  if (!territorySetWithFromLocation) {
    throw new Error("Invalid Territory!");
  }
  if (!territorySetWithFromLocation.includes(to)) {
    throw new Error("Territories are not connected");
  }
  const fromTerritoryTroopCount = territories[from].troopCount;

  if (fromTerritoryTroopCount < troopCount + 1) {
    throw new Error("Invalid troop Count");
  }

  if (to === from) {
    throw new Error(ERROR_MESSAGE.INVALID_SAME_TERRITORY);
  }
};

export const fortificationService = (game, data) => {
  const state = game.getGameState();
  if (state !== STATES.FORTIFICATION) {
    throw ERROR_MESSAGE.INVALID_ACTION;
  }

  const { to, from, count: troopCount } = data;

  const territories = game.getAllTerritories();
  const playerTerritory = game.getPlayerTerritory(game.activePlayerId);

  validateTerritory(territories, playerTerritory, from, to, troopCount);

  game.moveTroops(
    from,
    to,
    troopCount,
  );

  game.updateGame(
    STATES.FORTIFICATION,
    { from, to, troopCount },
    game.activePlayerId,
  );
  game.setNewState(STATES.GET_CARD);

  const updatedTerritories = game.getTerritoriesDetails(from, to);
  const newState = game.getGameState();
  return { action: newState, data: { updatedTerritories } };
};
