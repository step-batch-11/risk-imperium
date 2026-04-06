export const highlightTerritories = (territories, className = "selected") => {
  territories.forEach((territory) => {
    const territoryElement = document.querySelector(
      `[data-territory-id="${territory}"]`,
    );
    territoryElement.classList.add(className);
  });
};

export const removeHighlights = (className) => {
  const territories = document.querySelectorAll(".territory");
  territories.forEach((territory) => {
    territory.classList.remove(className);
  });
};

export const addGlow = (cardContainer, selectedCards, glow) => {
  for (const card in selectedCards) {
    const cardElement = cardContainer.querySelector(`#${card}`);
    cardElement.className = "card " + glow;
  }
};
