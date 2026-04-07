import { combat } from "../server_calls.js";
import { showNotification } from "../utilities/notifications.js";
import { setUpNextPhase } from "../transition_handlers.js";
import { delay, updateTroopsInTerritories } from "../utilities.js";
import { captureTerritory } from "./capture_territory.js";
import {
  ATTACKER_DICE_CONFIGS,
  DEFENDER_DICE_CONFIGS,
  prepareOverlay,
  showDiceAnimations,
} from "../utilities/animate_dice.js";

export const handleCombat = async (prevData, _action, gameState) => {
  const { action: newState, data } = await combat(prevData);
  const overlay = prepareOverlay();
  showDiceAnimations(
    overlay,
    data.attackerDice,
    ATTACKER_DICE_CONFIGS,
    "attacker",
  );
  showDiceAnimations(
    overlay,
    data.defenderDice,
    DEFENDER_DICE_CONFIGS,
    "defender",
  );

  await delay(2000);

  updateTroopsInTerritories(gameState, data.updatedTerritories);
  showNotification(data.notifyMsg.msg, data.notifyMsg.status);

  if (data.hasCaptured) {
    captureTerritory(gameState, prevData, data);
    return;
  }

  setUpNextPhase(gameState, newState);
};
