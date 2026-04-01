export const highlightTerritories = (territories, className = "selected") => {
  territories.forEach((territory) => {
    const territoryElement = document.querySelector(
      `[data-territory-id="${territory}"]`,
    );
    territoryElement.classList.add(className);
    territoryElement.parentElement.append(territoryElement);
  });
};

export const removeHighlights = (className) => {
  const territories = document.querySelectorAll(".territory");
  territories.forEach((territory) => {
    territory.classList.remove(className);
  });
};
