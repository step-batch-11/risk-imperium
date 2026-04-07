import { STATES } from "../config.js";
import { sendUpdatesToPlayers } from "../utilities.js";

const isValidTerritoryForFortification = (to, from, game) => {
  if (!game.isCurrentUserTerritory(to)) {
    return false;
  }
  if (!game.isCurrentUserTerritory(from)) {
    return false;
  }

  return to !== from;
};

export const fortificationHandler = (
  game,
  data,
  _currentPlayerId,
  opponents,
) => {
  const state = game.getGameState();
  if (state !== STATES.FORTIFICATION) {
    return { action: state, data: [] };
  }
  const { to, from, count: troopCount } = data;

  const isValid = isValidTerritoryForFortification(to, from, game);

  if (!isValid) {
    return { action: state, data: [] };
  }

  const updatedTerritories = game.fortification(from, to, troopCount);

  const newState = game.getGameState();
  const lastUpdate = game.lastUpdate;

  sendUpdatesToPlayers(STATES.WAITING, lastUpdate, opponents);

  return { action: newState, data: updatedTerritories };
};
