import { combat } from "../server_calls.js";
import { renderGameState } from "../utilities/render_UI.js";
import { showNotification } from "../utilities/notifications.js";
import { setUpNextPhase } from "../transition_handlers.js";

const updateTroopsInMap = (territoryId, troopsCount) => {
  const territoryElement = document.querySelector(
    `[data-territory-id="${territoryId}"]`,
  );
  const troopCountElement = territoryElement.querySelector(".troop-count");
  troopCountElement.textContent = troopsCount;
};

const updateMap = (prevData, data) => {
  setTimeout(() => {
    updateTroopsInMap(prevData.attackerTerritoryId, data.attackerTroops);
    updateTroopsInMap(prevData.defenderTerritoryId, data.defenderTroops);
    showNotification(data.notifyMsg.msg, data.notifyMsg.status);
  }, 1100);
};

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
  updateDiceTray("#attacker-dice", data.attackerDice);
  updateDiceTray("#defender-dice", data.defenderDice);

  renderGameState(newState);
  updateMap(prevData, data);

  setUpNextPhase(gameState, newState);
};
