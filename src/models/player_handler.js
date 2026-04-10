export class Player {
  #id;
  #name;
  #cards;
  #resolver;
  #colorId;
  #avatar;

  constructor(id, name, avatar, cards = []) {
    this.#id = id;
    this.#name = name;
    this.#cards = cards;
    this.#colorId;
    this.#avatar = avatar;
  }

  get id() {
    return this.#id;
  }
  get name() {
    return this.#name;
  }

  get avatar() {
    return this.#avatar;
  }

  get cards() {
    return this.#cards;
  }
  set color(colorId) {
    this.#colorId = colorId;
  }

  getBasicDetails() {
    return {
      id: this.#id,
      name: this.#name,
      colorId: this.#colorId,
      avatar: this.#avatar,
    };
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
