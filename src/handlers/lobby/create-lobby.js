import { AVATARS } from "../../config.js";
import { LOBBY_TYPES } from "../../config/lobby.js";
import { LOBBY_STATES } from "../../config/lobby_states.js";
import { getCookie } from "hono/cookie";
import { Player } from "../../models/player.js";

export const createLobby = (id, roomType = LOBBY_TYPES.PUBLIC) => {
  const avatars = structuredClone(AVATARS);
  return {
    id,
    players: [],
    status: LOBBY_STATES.WAITING,
    roomType,
    getAvatar: () => avatars.pop(),
    addAvatar: (avatar) => avatars.push(avatar),
  };
};

export const createPlayer = (context, avatar) => {
  const players = context.get("players");

  const playerId = Number(getCookie(context, "playerId"));
  const username = players[playerId];

  const playerAvatar = avatar;
  const player = new Player(playerId, username, playerAvatar);

  return player;
};
