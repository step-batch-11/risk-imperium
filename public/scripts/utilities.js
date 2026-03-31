export const getOwnedContinents = (player, continents) => {
  return Object.values(continents).filter((continent) => {
    continent.territories.every((territory) =>
      player.territories.includes(territory)
    );
  });
};

export const longPool = async (api) => {
  const res = await fetch(api);
  if (res.status === 204) {
    return longPool(api);
  }
  return res.json();
};

export const updateTroopCount = (territory, { newTroopCount }) => {
  const troopCount = territory.querySelector(".troop-count");
  troopCount.textContent = newTroopCount;
};

let notifyTimer;

export const showNotification = (message, status = "info", duration = 3000) => {
  const notification = document.querySelector("#notification-container");
  notification.className = `notification ${status}`;
  notification.textContent = message;

  clearTimeout(notifyTimer);

  notifyTimer = setTimeout(() => {
    notification.classList.remove(status);
  }, duration);
};

export const displayRemainingTroopsToDisplay = (remainingTroops) => {
  const display = document.querySelector("#remaining-troops-to-deploy");
  display.textContent = remainingTroops
    ? `Remaining Troops To Deploy: ${remainingTroops}`
    : "";
};
