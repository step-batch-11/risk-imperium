import { defend } from "../server_calls.js";
import { handleCombat } from "./resolve_combat.js";

export const handleDefend = async (territory, gameState) => {
  const territoryId = Number(territory.dataset.territoryId);
  const defendData = { territoryId, troopCount: 1 };
  const { action, data } = await defend(defendData);
  gameState.state = action;
  return await handleCombat(data, action, gameState);
};
