export class Player {
  #id;
  #name;
  #cards;
  #resolver;
  #colorId;
  constructor(id, name, cards = []) {
    this.#id = id;
    this.#name = name;
    this.#cards = cards;
    this.#colorId;
  }

  get id() {
    return this.#id;
  }
  get name() {
    return this.#name;
  }

  get cards() {
    return this.#cards;
  }
  set color(colorId) {
    this.#colorId = colorId;
  }

  getBasicDetails() {
    return { id: this.#id, name: this.#name, colorId: this.#colorId };
  }

  set resolve(resolve) {
    this.#resolver = resolve;
  }

  get resolve() {
    return this.#resolver;
  }

  getSaveableData() {
    return structuredClone({
      id: this.#id,
      name: this.#name,
      cards: this.#cards,
    });
  }

  loadSaveGame(cards) {
    this.#cards = cards;
  }
}
