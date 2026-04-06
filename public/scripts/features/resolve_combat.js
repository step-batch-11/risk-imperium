import { combat } from "../server_calls.js";
import { showNotification } from "../utilities/notifications.js";
import { setUpNextPhase } from "../transition_handlers.js";
import { delay, updateTroopsInTerritories } from "../utilities.js";
import { captureTerritory } from "./captureTerritory.js";
import { showDiceAnimation } from "../utilities/dice_animation.js";

export const handleCombat = async (prevData, _action, gameState) => {
  const { action: newState, data } = await combat(prevData);
  showDiceAnimation([data.attackerDice, data.defenderDice]);

  await delay(2000);

  updateTroopsInTerritories(gameState, data.updatedTerritories);
  showNotification(data.notifyMsg.msg, data.notifyMsg.status);

  if (data.hasCaptured) {
    captureTerritory(gameState, prevData, data);
    return;
  }

  setUpNextPhase(gameState, newState);
};
