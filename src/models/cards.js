export class Cards {
  #cardTypes;
  constructor() {
    this.#cardTypes = ["1", "2", "3", "4"];
  }

  drawCard(randomFn = Math.random) {
    const roll = Math.floor(randomFn() * 10);
    if (roll < 3) return "1";
    if (roll < 6) return "2";
    if (roll < 9) return "3";
    return "4";
  }

  isValidCombination(combination) {
    const set = new Set();
    combination.sort((a, b) => a - b);
    const allSame = combination.every((x) => {
      return combination[0] === x || x === "4";
    });
    combination.forEach((x) => {
      set.add(x);
    });
    const allDifferent = set.size === 3;

    return allDifferent || allSame;
  }
}
