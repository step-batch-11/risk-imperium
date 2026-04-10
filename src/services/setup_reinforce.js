import { CONFIG } from "../config.js";

const getOwnedContinents = (territoryIds) => {
  return Object.values(CONFIG.CONTINENTS).filter(
    (continent) =>
      continent.territories.every((territoryId) =>
        territoryIds.includes(territoryId)
      ),
  );
};

const calculateContinentsBonus = (territoryIds) => {
  const ownedContinents = getOwnedContinents(territoryIds);
  return ownedContinents.reduce((total, { armies }) => total + armies, 0);
};

export const getReinforcementCount = (territories) => {
  const continentBonus = calculateContinentsBonus(territories);

  const reinforcementForTerritory = Math.max(
    3,
    Math.floor(territories.length / 3),
  );

  return reinforcementForTerritory + continentBonus;
};
