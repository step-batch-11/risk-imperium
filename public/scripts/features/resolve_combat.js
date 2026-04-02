import { combat } from "../server_calls.js";

import { showNotification } from "../utilities/notifications.js";
import { setUpNextPhase } from "../transition_handlers.js";
import { delay, updateTroopsInTerritories } from "../utilities.js";

const updateDiceTray = (selector, diceValues) => {
  const dieElements = document.querySelectorAll(`${selector} .die-slot`);
  dieElements.forEach((dice, index) => {
    const rollValue = diceValues[index];
    dice.innerHTML = "";

    if (rollValue) {
      dice.innerHTML = `&#${9855 + rollValue};`;
      dice.classList.add("dice-roll");
      dice.addEventListener(
        "animationend",
        (e) => {
          if (e.animationName === "roll") {
            dice.classList.remove("dice-roll");
            dice.innerHTML = `&#${9855 + rollValue};`;
          }
        },
        { once: true },
      );
    }
  });
};

export const handleCombat = async (prevData, _action, gameState) => {
  const { action: newState, data } = await combat(prevData);
  console.log("COMBAT", { data });

  updateDiceTray("#attacker-dice", data.attackerDice);
  updateDiceTray("#defender-dice", data.defenderDice);

  await delay(1100);

  updateTroopsInTerritories(gameState, data.updatedTerritories);
  showNotification(data.notifyMsg.msg, data.notifyMsg.status);

  setUpNextPhase(gameState, newState);
};
