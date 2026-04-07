export class Player {
  #id;
  #name;
  #cards;

  constructor(id, name, cards = []) {
    this.#id = id;
    this.#name = name;
    this.#cards = cards;
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

  set cards(cards) {
    this.#cards = cards;
  }
  getBasicDetails() {
    return { id: this.#id, name: this.#name };
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
