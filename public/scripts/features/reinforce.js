import { reinforce } from "../APIS.js";
import { SETUP } from "../config.js";

import { renderGameState, updateTroopCount } from "../utilities.js";

const isOwnedByCurrentPlayer = (territoryId, playerTerritoryIds) =>
  playerTerritoryIds.includes(territoryId);

const placeInitialTroops = async (gameState, territory, territoryId) => {
  const data = { territoryId, troopCount: 1 };
  const response = await reinforce(data);
  const { action: nextState, data: updatedTerritory } = response;
  if (nextState !== gameState.state) {
    renderGameState(nextState);
    if (nextState in SETUP) {
      SETUP[nextState](gameState);
    }
  }
  gameState.state = nextState;
  updateTroopCount(territory, updatedTerritory);

  const playerName = gameState.player.name;
  const territoryName = gameState.territories[territoryId].name;
  return {
    message: `${playerName} deployed 1 troop in ${territoryName}`,
    status: "success",
    remainingTroopsToDeploy: updatedTerritory.remainingTroops,
  };
};

export const handleInitialReinforcement = async (territory, gameState) => {
  const territoryId = Number(territory.dataset.territoryId);
  const territories = gameState.player.territories;

  if (!isOwnedByCurrentPlayer(territoryId, territories)) {
    const territoryName = gameState.territories[territoryId].name;

    return {
      message: `${territoryName} isn't under your control`,
      status: "warning",
    };
  }

  return await placeInitialTroops(gameState, territory, territoryId);
};
