import { combat } from "../APIS.js";
import {
  renderGameState,
  setUpNextPhase,
  showNotification,
} from "../utilities.js";

const updateTroopsInMap = (territoryId, troopsCount) => {
  const territoryElement = document.querySelector(
    `[data-territory-id="${territoryId}"]`,
  );
  const troopCountElement = territoryElement.querySelector(".troop-count");
  troopCountElement.textContent = troopsCount;
};

const updateMap = (prevData, data) => {
  updateTroopsInMap(prevData.attackerTerritoryId, data.attackerTroops);
  updateTroopsInMap(prevData.defenderTerritoryId, data.defenderTroops);
  showNotification(data.msg, "success");
};

const updateDiceTray = (selector, diceValues) => {
  const dieElements = document.querySelectorAll(`${selector} .die-slot`);
  dieElements.forEach((dice, index) => {
    const rollValue = diceValues[index];
    dice.innerHTML = "";

    if (rollValue) {
      dice.innerHTML = `&#${9855 + rollValue};`;
      dice.classList.add("dice-roll");
      dice.addEventListener("animationend", (e) => {
        if (e.animationName === "roll") {
          dice.classList.remove("dice-roll");
          dice.innerHTML = `&#${9855 + rollValue};`;
        }
      }, { once: true });
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
