import { combat, defend } from "../APIS.js";

export const handleDefend = async (territory, gameState) => {
  const territoryId = Number(territory.dataset.territoryId);
  const defendData = { territoryId, troopCount: 1 };

  const { action, data } = await defend(defendData);
  gameState.state = action;
  await handleCombat(data, action, gameState);
};

const handleCombat = async (prevData, _prevAction, _gameState) => {
  const { _action, _data } = await combat(prevData);
  // gameState = await getGameState();
};
