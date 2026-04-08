export class Player {
  #id;
  #name;
  #cards;
  #resolver;
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

  getBasicDetails() {
    return { id: this.#id, name: this.#name };
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
