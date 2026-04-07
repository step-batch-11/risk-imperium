export const CONFIG = {
  TERRITORIES: {
    1: { name: "Alaska", neighbours: [2, 4, 32], troopCount: 0 },
    2: {
      name: "Northwest Territory",
      neighbours: [1, 3, 4, 5],
      troopCount: 0,
    },
    3: { name: "Greenland", neighbours: [2, 5, 6, 14], troopCount: 0 },
    4: { name: "Alberta", neighbours: [1, 2, 5, 7], troopCount: 0 },
    5: { name: "Ontario", neighbours: [2, 3, 4, 6, 7, 8], troopCount: 0 },
    6: { name: "Quebec", neighbours: [3, 5, 8], troopCount: 0 },
    7: {
      name: "Western United States",
      neighbours: [4, 5, 8, 9],
      troopCount: 0,
    },
    8: {
      name: "Eastern United States",
      neighbours: [5, 6, 7, 9],
      troopCount: 0,
    },
    9: { name: "Central America", neighbours: [7, 8, 10], troopCount: 0 },
    10: { name: "Venezuela", neighbours: [9, 11, 12], troopCount: 0 },
    11: { name: "Peru", neighbours: [10, 12, 13], troopCount: 0 },
    12: { name: "Brazil", neighbours: [10, 11, 13, 21], troopCount: 0 },
    13: { name: "Argentina", neighbours: [11, 12], troopCount: 0 },
    14: { name: "Iceland", neighbours: [3, 15, 17], troopCount: 0 },
    15: {
      name: "Scandinavia",
      neighbours: [14, 16, 17, 18],
      troopCount: 0,
    },
    16: {
      name: "Ukraine",
      neighbours: [15, 18, 20, 23, 28, 35],
      troopCount: 0,
    },
    17: {
      name: "Great Britain",
      neighbours: [14, 15, 18, 19],
      troopCount: 0,
    },
    18: {
      name: "Northern Europe",
      neighbours: [15, 16, 17, 19, 20],
      troopCount: 0,
    },
    19: {
      name: "Western Europe",
      neighbours: [17, 18, 20, 21],
      troopCount: 0,
    },
    20: {
      name: "Southern Europe",
      neighbours: [16, 18, 19, 21, 22, 23],
      troopCount: 0,
    },
    21: {
      name: "North Africa",
      neighbours: [12, 19, 20, 22, 24, 25],
      troopCount: 0,
    },
    22: { name: "Egypt", neighbours: [20, 21, 23, 24], troopCount: 0 },
    23: {
      name: "Middle East",
      neighbours: [16, 20, 22, 24, 35, 37],
      troopCount: 0,
    },
    24: {
      name: "East Africa",
      neighbours: [21, 22, 23, 25, 26, 27],
      troopCount: 0,
    },
    25: { name: "Congo", neighbours: [21, 24, 26], troopCount: 0 },
    26: { name: "South Africa", neighbours: [24, 25, 27], troopCount: 0 },
    27: { name: "Madagascar", neighbours: [26, 24], troopCount: 0 },
    28: { name: "Ural", neighbours: [16, 29, 37, 35, 36], troopCount: 0 },
    29: {
      name: "Siberia",
      neighbours: [28, 30, 31, 33, 36],
      troopCount: 0,
    },
    30: { name: "Yakutsk", neighbours: [29, 31, 32], troopCount: 0 },
    31: { name: "Irkutsk", neighbours: [29, 30, 32, 33], troopCount: 0 },
    32: {
      name: "Kamchatka",
      neighbours: [1, 30, 31, 33, 34],
      troopCount: 0,
    },
    33: {
      name: "Mongolia",
      neighbours: [29, 31, 32, 34, 36],
      troopCount: 0,
    },
    34: { name: "Japan", neighbours: [32, 33], troopCount: 0 },
    35: {
      name: "Afghanistan",
      neighbours: [16, 23, 28, 36, 37],
      troopCount: 0,
    },
    36: {
      name: "China",
      neighbours: [28, 29, 35, 33, 37, 38],
      troopCount: 0,
    },
    37: { name: "India", neighbours: [35, 36, 38, 23], troopCount: 0 },
    38: { name: "Siam", neighbours: [36, 37, 39], troopCount: 0 },
    39: { name: "Indonesia", neighbours: [38, 40, 41], troopCount: 0 },
    40: { name: "New Guinea", neighbours: [39, 41, 42], troopCount: 0 },
    41: {
      name: "Western Australia",
      neighbours: [39, 40, 42],
      troopCount: 0,
    },
    42: { name: "Eastern Australia", neighbours: [39, 40, 41], troopCount: 0 },
  },
  CONTINENTS: {
    1: {
      name: "Asia",
      territories: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 23],
      armies: 7,
    },

    2: {
      name: "Africa",
      territories: [21, 22, 24, 25, 26, 27],
      armies: 3,
    },

    3: {
      name: "North America",
      territories: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      armies: 5,
    },

    4: {
      name: "South America",
      territories: [10, 11, 12, 13],
      armies: 2,
    },

    5: {
      name: "Europe",
      territories: [14, 15, 16, 17, 18, 19, 20],
      armies: 5,
    },

    6: {
      name: "Australia",
      territories: [39, 40, 41, 42],
      armies: 2,
    },
  },
};

export const STATES = {
  SETUP: "SETUP",
  WAITING: "WAITING",
  START: "START",
  INITIAL_TERRITORY_ALLOCATION: "INITIAL_TERRITORY_ALLOCATION",
  INITIAL_REINFORCEMENT: "INITIAL_REINFORCEMENT",
  REINFORCE: "REINFORCE",
  RESOLVE_COMBAT: "RESOLVE_COMBAT",
  INVASION: "INVASION",
  DEFEND: "DEFEND",
  FORTIFICATION: "FORTIFICATION",
  SKIP_FORTIFICATION: "SKIP_FORTIFICATION",
  GET_CARD: "GET_CARD",
  CAPTURE: "CAPTURE",
  SKIP_INVASION: "SKIP_INVASION",
  WON: "WON",
  TRADE_CARD: "TRADE_CARD",
  MOVE_IN: "MOVE_IN",
};
