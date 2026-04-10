import { Player } from "./models/player_handler.js";

export const mockPlayers = () => {
  const players = [
    { id: 1, name: "Jon", cards: [], color: () => {} },
    { id: 2, name: "Rob", cards: [], color: () => {} },
    { id: 3, name: "Sansa", cards: [], color: () => {} },
    { id: 4, name: "Arya", cards: [], color: () => {} },
    { id: 5, name: "Rickon", cards: [], color: () => {} },
    { id: 6, name: "Bran", cards: [1, 2, 3], color: () => {} },
  ];

  return players.map(({ id, name, cards }) => new Player(id, name, cards));
};
