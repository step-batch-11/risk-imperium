import { setupDeployControls } from "./listeners.js";

export const getOwnedContinents = (player, continents) => {
  return Object.values(continents).filter((continent) => {
    return continent.territories.every((territory) =>
      player.territories.includes(territory)
    );
  });
};

export const getAllPlayersDetail = (player, opponents) => {
  const { id: currentPlayerId } = player;

  return { ...opponents, [currentPlayerId]: player };
};

export const setTroopLimit = (maxTroops, min = 1, defaultValue = 1) => {
  const input = document.querySelector("#troop-count-input");
  input.max = maxTroops;
  input.min = min;
  input.value = defaultValue;
};

const getTerritoryElementIdByTerritoryId = (territories, territoryId) => {
  const territoryName = territories[territoryId].name;
  return territoryName.toLowerCase().replaceAll(" ", "-");
};

export const getTerritoryElementById = (territories, territoryId) => {
  const territoryElementId = getTerritoryElementIdByTerritoryId(
    territories,
    territoryId,
  );

  const territoryElement = document.querySelector(`#${territoryElementId}`);

  return territoryElement;
};

export const updateTroopsInTerritories = (gameState, territories) => {
  territories.forEach(({ territoryId, troopCount }) => {
    const territoryElement = getTerritoryElementById(
      gameState.territories,
      territoryId,
    );
    const territoryTroopCountElement = territoryElement.querySelector(
      ".troop-count",
    );

    territoryTroopCountElement.textContent = troopCount;
    gameState.territories[territoryId].troopCount = troopCount;
  });
};

export const delay = (duration) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, duration);
  });
};

const setLocation = (dialog, x, y) => {
  dialog.style.left = `${x}px`;
  dialog.style.top = `${y}px`;
};

export const removeSkipButton = () => {
  const skipButtonElement = document.querySelector("#skip-button");
  if (skipButtonElement) skipButtonElement.remove();
};

export const addListenerTroopSelector = (handleSelection) => {
  const dialog = document.querySelector("#deploy-troops-container");
  const form = dialog.querySelector("#deploy-troops-form");
  const input = form.querySelector("input");
  form.onsubmit = async (e) => {
    e.preventDefault();
    dialog.close();

    const troopCount = Number(input.value);
    await handleSelection(troopCount);
  };
};

export const displayTroopSelector = (event, cancelDisabled = false) => {
  const dialog = document.querySelector("#deploy-troops-container");
  const cancelBtn = dialog.querySelector("#cancel-deploy-btn");
  cancelBtn.disabled = cancelDisabled;
  dialog.showModal();

  setLocation(dialog, event.x, event.y);
  setupDeployControls(dialog);
  return dialog;
};

export const getPlayerById = (players, territoryId) =>
  Object.values(players).find((player) =>
    player.territories.includes(territoryId)
  );

export const getIndexOf = (collection, target) =>
  collection.findIndex((element) => element === target);
