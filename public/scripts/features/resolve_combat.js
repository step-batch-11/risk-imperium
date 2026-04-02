import { combat } from "../server_calls.js";

import { showNotification } from "../utilities/notifications.js";
import { setUpNextPhase } from "../transition_handlers.js";
import {
  delay,
  getTerritoryElementById,
  updateTroopsInTerritories,
} from "../utilities.js";
import { renderPlayersDetails } from "./setup.js";

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

const getPlayerById = (players, territoryId) => {
  return Object.values(players).find((player) =>
    player.territories.includes(territoryId)
  );
};

const getIndexOf = (territories, opponentTerritoryId) => {
  return territories.findIndex((territoryId) =>
    territoryId === opponentTerritoryId
  );
};

const captureTerritory = (
  gameState,
  { defenderTerritoryId },
  { updatedTerritories },
) => {
  updatedTerritories.forEach(({ territoryId, troopCount }) => {
    gameState.territories[territoryId].troopCount = troopCount;
  });

  const defender = getPlayerById(gameState.opponents, defenderTerritoryId);
  const index = getIndexOf(defender.territories, defenderTerritoryId);
  const territoryElement = getTerritoryElementById(
    gameState.territories,
    defenderTerritoryId,
  );
  territoryElement.setAttribute("data-player", gameState.player.id);
  gameState.player.territories.push(...defender.territories.splice(index, 1));

  const msg = `${gameState.player.name} captured ${
    gameState.territories[defenderTerritoryId].name
  }`;
  renderPlayersDetails(gameState);
  showNotification(msg);
};

export const handleCombat = async (prevData, _action, gameState) => {
  const { action: newState, data } = await combat(prevData);
  updateDiceTray("#attacker-dice", data.attackerDice);
  updateDiceTray("#defender-dice", data.defenderDice);

  await delay(1100);

  updateTroopsInTerritories(gameState, data.updatedTerritories);
  showNotification(data.notifyMsg.msg, data.notifyMsg.status);

  if (data.hasCaptured) {
    captureTerritory(gameState, prevData, data);
  }

  setUpNextPhase(gameState, newState);
};
