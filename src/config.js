export const CONFIG = {
  TERRITORIES: {
    1: { name: "Alaska", neighbours: [2, 4, 32], troopCount: 10 },
    2: {
      name: "Northwest Territory",
      neighbours: [1, 3, 4, 5],
      troopCount: 38,
    },
    3: { name: "Greenland", neighbours: [2, 5, 6, 14], troopCount: 19 },
    4: { name: "Alberta", neighbours: [1, 2, 5, 7], troopCount: 17 },
    5: { name: "Ontario", neighbours: [2, 3, 4, 6, 7, 8], troopCount: 2 },
    6: { name: "Quebec", neighbours: [3, 5, 8], troopCount: 21 },
    7: {
      name: "Western United States",
      neighbours: [4, 5, 8, 9],
      troopCount: 18,
    },
    8: {
      name: "Eastern United States",
      neighbours: [5, 6, 7, 9],
      troopCount: 14,
    },
    9: { name: "Central America", neighbours: [7, 8, 10], troopCount: 16 },
    10: { name: "Venezuela", neighbours: [9, 11, 12], troopCount: 29 },
    11: { name: "Peru", neighbours: [10, 12, 13], troopCount: 32 },
    12: { name: "Brazil", neighbours: [10, 11, 13, 21], troopCount: 7 },
    13: { name: "Argentina", neighbours: [11, 12], troopCount: 24 },
    14: { name: "Iceland", neighbours: [3, 15, 17], troopCount: 13 },
    15: {
      name: "Scandinavia",
      neighbours: [14, 16, 17, 18],
      troopCount: 38,
    },
    16: {
      name: "Ukraine",
      neighbours: [15, 18, 19, 20, 27, 34],
      troopCount: 36,
    },
    17: {
      name: "Great Britain",
      neighbours: [14, 15, 18, 19],
      troopCount: 7,
    },
    18: {
      name: "Northern Europe",
      neighbours: [15, 16, 17, 19, 20],
      troopCount: 23,
    },
    19: {
      name: "Western Europe",
      neighbours: [17, 18, 20, 21],
      troopCount: 15,
    },
    20: {
      name: "Southern Europe",
      neighbours: [16, 18, 19, 21, 22, 23],
      troopCount: 36,
    },
    21: {
      name: "North Africa",
      neighbours: [12, 19, 20, 22, 24, 25],
      troopCount: 8,
    },
    22: { name: "Egypt", neighbours: [20, 21, 23, 24], troopCount: 37 },
    23: {
      name: "Middle East",
      neighbours: [16, 20, 22, 24, 35, 37],
      troopCount: 46,
    },
    24: {
      name: "East Africa",
      neighbours: [21, 22, 23, 25, 26, 28],
      troopCount: 7,
    },
    25: { name: "Congo", neighbours: [21, 24, 26], troopCount: 26 },
    26: { name: "South Africa", neighbours: [24, 25, 27], troopCount: 22 },
    27: { name: "Madagascar", neighbours: [26, 24], troopCount: 22 },
    28: { name: "Ural", neighbours: [16, 23, 29, 31], troopCount: 34 },
    29: {
      name: "Siberia",
      neighbours: [28, 30, 31, 33, 36],
      troopCount: 3,
    },
    30: { name: "Yakutsk", neighbours: [1, 29, 32, 33], troopCount: 27 },
    31: { name: "Irkutsk", neighbours: [29, 30, 32, 33, 34], troopCount: 44 },
    32: {
      name: "Kamchatka",
      neighbours: [29, 30, 31, 33, 35],
      troopCount: 32,
    },
    33: {
      name: "Mongolia",
      neighbours: [29, 30, 32, 34, 35],
      troopCount: 46,
    },
    34: { name: "Japan", neighbours: [32, 33], troopCount: 40 },
    35: {
      name: "Afghanistan",
      neighbours: [16, 23, 28, 36, 37],
      troopCount: 22,
    },
    36: {
      name: "China",
      neighbours: [28, 29, 35, 33, 37, 38],
      troopCount: 44,
    },
    37: { name: "India", neighbours: [35, 36, 38, 23], troopCount: 30 },
    38: { name: "Siam", neighbours: [36, 37, 39], troopCount: 36 },
    39: { name: "Indonesia", neighbours: [38, 40, 41], troopCount: 26 },
    40: { name: "New Guinea", neighbours: [39, 41, 42], troopCount: 46 },
    41: {
      name: "Western Australia",
      neighbours: [39, 40, 42],
      troopCount: 40,
    },
    42: { name: "Eastern Australia", neighbours: [40, 41], troopCount: 12 },
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
