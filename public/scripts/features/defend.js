import { combat, defend } from "../APIS.js";

export const handleDefend = async (territory, gameState) => {
  const territoryId = Number(territory.dataset.territoryId);
  const defendData = { territoryId, troopCount: 1 };

  const { action: nextAction, data } = await defend(defendData);
  gameState.state = action;
  await handleCombat(data, nextAction, gameState);
};

const handleCombat = async (prevData, _, _gameState) => {
  const { _action, data } = await combat(prevData);
  const diceValues = [...data.attackerDice, ...data.defenderDice];
  const dieElements = document.querySelectorAll(".die-slot");

  dieElements.forEach((dice, index) => {
    dice.classList.toggle(".dice-roll");
    dice.textContent = diceValues[index];
  });
};
