import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { Player } from "../models/player.js";
import { createGame } from "../create_game.js";
import { AVATARS } from "../config.js";
import { LOBBY_CONFIG } from "../config/lobby.js";

const createLobby = (id, roomType = "public") => {
  const avatars = structuredClone(AVATARS);
  return {
    id,
    players: [],
    status: "waiting",
    roomType,
    getAvatar: () => avatars.pop(),
    addAvatar: (avatar) => avatars.push(avatar),
  };
};

const setGameId = (context) => {
  const lobbyId = getCookie(context, "lobbyId");
  const lobbies = context.get("lobbies");
  const lobby = lobbies.get(Number(lobbyId));
  if (lobby.status === "waiting") {
    return { ok: false, lobby };
  }
  const gamesRepo = context.get("gamesRepo");
  const game = createGame(lobby.players);
  gamesRepo.set(lobby.id, game);
  setCookie(context, "gameId", lobbyId);
  return { ok: true, lobby };
};

const createPlayer = (context, avatar) => {
  const players = context.get("players");

  const playerId = Number(getCookie(context, "playerId"));
  const username = players[playerId];

  const playerAvatar = avatar;
  const player = new Player(playerId, username, playerAvatar);

  return player;
};

const isRoomFilled = (lobby) =>
  lobby.players.length === LOBBY_CONFIG.MAX_PLAYER;

export const startGame = (context) => {
  const game = setGameId(context);
  if (game.ok) {
    game.lobby.status = "game-started";
  }
  return context.json(game);
};

export const joinRoom = async (context) => {
  const lobbies = context.get("lobbies");
  const { roomId } = await context.req.json();

  const lobby = lobbies.get(Number(roomId));

  if (lobby && !isRoomFilled(lobby)) {
    setCookie(context, "lobbyId", roomId);
    return moveJoineeToLobby(context, lobby);
  }

  return context.json({ success: false });
};

const moveJoineeToLobby = (context, lobby) => {
  const player = createPlayer(context, lobby.getAvatar());
  const exists = lobby.players.some((p) => p.id === player.id);

  if (!exists) {
    lobby.players.push(player);
  }
  if (lobby.players.length >= LOBBY_CONFIG.MIN_PLAYER_REQUIRED) {
    lobby.status = "in-game";
  }
  return context.json({ success: true });
};

export const createRoom = (context) => {
  const lobbies = context.get("lobbies");
  const counter = context.get("counter");
  const lobbyId = counter.value++;
  const lobby = createLobby(lobbyId, "private");
  const player = createPlayer(context, lobby.getAvatar());
  lobby["host"] = +player.id;
  lobbies.set(lobbyId, lobby);
  lobby.players.push(player);
  setCookie(context, "lobbyId", lobbyId);

  return context.redirect("/lobby.html");
};

export const moveToLobby = (context) => {
  const lobbies = context.get("lobbies");

  console.log(lobbies);

  let lobby = [...lobbies.values()].find(
    (lobby) =>
      lobby.players.length < LOBBY_CONFIG.MAX_PLAYER &&
      lobby.status === "waiting" &&
      lobby.roomType !== "private",
  );
  console.log(lobby);

  if (!lobby) {
    const lobbyId = Date.now();
    lobby = createLobby(lobbyId);
    lobbies.set(lobbyId, lobby);
  }

  const player = createPlayer(context, lobby.getAvatar());

  lobby.players.push(player);
  setCookie(context, "lobbyId", lobby.id);

  if (lobby.players.length === LOBBY_CONFIG.MAX_PLAYER) {
    lobby.status = "in-game";
    const gamesRepo = context.get("gamesRepo");
    const game = createGame(lobby.players);
    gamesRepo.set(lobby.id, game);
  }

  return context.redirect("/lobby.html");
};

export const sendLobbyData = (context) => {
  const lobbies = context.get("lobbies");
  const playerId = Number(getCookie(context, "playerId"));
  const lobbyId = getCookie(context, "lobbyId");
  const lobby = lobbies.get(Number(lobbyId));

  if (lobby.status === "in-game" && lobby.roomType === "public") {
    setCookie(context, "gameId", lobby.id);
  }
  if (lobby.status === "game-started") {
    setCookie(context, "gameId", lobby.id);
  }

  const data = {
    playerDetails: lobby.players.map((p) => ({
      name: p.name,
      avatar: p.avatar,
    })),
    data: lobby,
    isHost: playerId === lobby.host,
  };

  return context.json(data);
};

export const leaveLobbyHandler = (context) => {
  const lobbies = context.get("lobbies");
  const lobbyId = getCookie(context, "lobbyId");

  const lobby = lobbies.get(Number(lobbyId));
  const playerId = Number(getCookie(context, "playerId"));
  const response = { data: {} };
  if (
    lobby.status === "waiting" ||
    (lobby.roomType === "private" && lobby.status === "in-game")
  ) {
    const playerIdx = lobby.players.findIndex(
      (player) => player.id === playerId,
    );

    const player = lobby.players.splice(playerIdx, 1);
    const avatar = player[0].avatar;
    lobby.addAvatar(avatar);
    console.log({ player, avatar });
    lobby.status = lobby.players.length < LOBBY_CONFIG.MIN_PLAYER_REQUIRED
      ? "waiting"
      : "in-game";
    response.action = "LEAVE";
    response.data = { success: true };
    deleteCookie(context, "lobbyId");
  }

  return context.json(response);
};
