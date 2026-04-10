import { PLAYERS } from "./config/staticData.js";
import { Player } from "./models/player.js";

export const mockPlayers = () => {
  return PLAYERS.map(({ id, name, cards }) => new Player(id, name, cards));
};
