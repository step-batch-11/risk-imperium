import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createGame } from "../../create_game.js";
import { LOBBY_CONFIG, LOBBY_TYPES } from "../../config/lobby.js";
import { LOBBY_STATES } from "../../config/lobby_states.js";
import { createLobby, createPlayer } from "./create-lobby.js";

const moveJoineeToLobby = (context, lobby) => {
  const player = createPlayer(context, lobby.getAvatar());
  const exists = lobby.players.some((p) => p.id === player.id);

  if (!exists) {
    lobby.players.push(player);
  }
  if (lobby.players.length >= LOBBY_CONFIG.MIN_PLAYER_REQUIRED) {
    lobby.status = LOBBY_STATES.READY;
  }
  return context.json({ success: true });
};

const setGameId = (context) => {
  const lobbyId = getCookie(context, "lobbyId");
  const lobbies = context.get("lobbies");
  const lobby = lobbies.get(Number(lobbyId));
  if (lobby.status === LOBBY_STATES.WAITING) {
    return { ok: false, lobby };
  }
  const gamesRepo = context.get("gamesRepo");
  const game = createGame(lobby.players);
  gamesRepo.set(lobby.id, game);
  setCookie(context, "gameId", lobbyId);
  return { ok: true, lobby };
};

const isRoomFilled = (lobby) =>
  lobby.players.length === LOBBY_CONFIG.MAX_PLAYER;

export const startGame = (context) => {
  const game = setGameId(context);
  if (game.ok) {
    game.lobby.status = LOBBY_STATES.IN_GAME;
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

export const createRoom = (context) => {
  const lobbies = context.get("lobbies");
  const counter = context.get("counter");
  const lobbyId = counter.value++;
  const lobby = createLobby(lobbyId, LOBBY_TYPES.PRIVATE);
  const player = createPlayer(context, lobby.getAvatar());
  lobby["host"] = +player.id;
  lobbies.set(lobbyId, lobby);
  lobby.players.push(player);
  setCookie(context, "lobbyId", lobbyId);

  return context.redirect("/lobby.html");
};

export const moveToLobby = (context) => {
  const lobbies = context.get("lobbies");

  let lobby = [...lobbies.values()].find(
    (lobby) =>
      lobby.players.length < LOBBY_CONFIG.MAX_PLAYER &&
      lobby.status === LOBBY_STATES.WAITING &&
      lobby.roomType !== LOBBY_TYPES.PRIVATE,
  );

  if (!lobby) {
    const lobbyId = Date.now();
    lobby = createLobby(lobbyId);
    lobbies.set(lobbyId, lobby);
  }

  const player = createPlayer(context, lobby.getAvatar());

  lobby.players.push(player);
  setCookie(context, "lobbyId", lobby.id);

  if (lobby.players.length === LOBBY_CONFIG.MAX_PLAYER) {
    lobby.status = LOBBY_STATES.IN_GAME;
    const gamesRepo = context.get("gamesRepo");
    const game = createGame(lobby.players);
    gamesRepo.set(lobby.id, game);
  }

  return context.redirect("/lobby.html");
};

export const sendLobbyData = (context) => {
  const lobbies = context.get("lobbies");
  const lobbyId = getCookie(context, "lobbyId");
  const lobby = lobbies.get(Number(lobbyId));

  const playerId = Number(getCookie(context, "playerId"));

  if (!lobby) {
    return context.text("Game NOt foudn ", 400);
  }
  if (
    lobby.status === LOBBY_STATES.IN_GAME
  ) {
    setCookie(context, "gameId", lobby.id);
  }

  const data = {
    playerDetails: lobby.players.map((p) => ({
      name: p.name,
      avatar: p.avatar,
      id: p.id,
      isHost: p.id === lobby.host,
    })),
    isHost: playerId === lobby.host,
    data: lobby,
    lobbyState: lobby.status,
  };

  return context.json(data);
};

export const leaveLobbyHandler = (context) => {
  const lobbies = context.get("lobbies");
  const lobbyId = Number(getCookie(context, "lobbyId"));

  const lobby = lobbies.get(lobbyId);

  const playerId = Number(getCookie(context, "playerId"));
  const response = { data: {} };
  if (
    lobby.status === LOBBY_STATES.WAITING ||
    lobby.status === LOBBY_STATES.READY
  ) {
    const playerIdx = lobby.players.findIndex(
      (player) => player.id === playerId,
    );

    const player = lobby.players.splice(playerIdx, 1);
    const avatar = player[0].avatar;
    lobby.addAvatar(avatar);

    lobby.status = (lobby.players.length < LOBBY_CONFIG.MIN_PLAYER_REQUIRED ||
        lobby.roomType === LOBBY_TYPES.PUBLIC)
      ? LOBBY_STATES.WAITING
      : LOBBY_STATES.READY;
    response.action = "LEAVE";
    response.data = { success: true };
    deleteCookie(context, "lobbyId");
    if (lobby.players.length === 0) {
      lobbies.delete(lobbyId);
      return context.json(response);
    }
    if (playerId === lobby.host) {
      lobby.host = lobby.players[0].id;
    }
  }

  return context.json(response);
};
