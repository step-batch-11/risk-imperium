import { LOBBY_STATES } from "../configs/lobby_states.js";

export const createAvatar = (name) => {
  const avatar = document.createElement("img");
  avatar.setAttribute("src", name.img);
  avatar.className = "player-profile";
  return avatar;
};

const displayRoomId = (lobbyId) => {
  const roomId = document.querySelector("#room-id");
  roomId.textContent = lobbyId;
};

const startGame = (id) => {
  clearInterval(id);
  globalThis.location = "/game.html";
};

const renderStartButton = () => {
  const navContainer = document.querySelector("#nav-container");
  const startBtn = document.createElement("button");
  startBtn.id = "start-btn";
  startBtn.textContent = "Start";
  navContainer.prepend(startBtn);

  return startBtn;
};

const addStartButton = (id) => {
  const startButton = document.querySelector("#start-btn");

  if (startButton) {
    return;
  }

  const startBtn = renderStartButton();
  startBtn.addEventListener("click", async () => {
    const res = await fetch("/start-game").then((x) => x.json());
    if (!res.ok) return;
    globalThis.location = "/game.html";
    clearInterval(id);
    return;
  });
};

const renderPlayerCard = ({ name, avatar, isHost }, id) => {
  const playerContainer = document.querySelector(`#player-${id + 1}`);
  const avatarContainer = playerContainer.querySelector(".player-avatar");
  const playerNameContainer = playerContainer.querySelector(
    ".player-name-container",
  );
  const hostConatiner = playerContainer.querySelector(".host");

  const playerAvatarElement = createAvatar(avatar);
  playerContainer.classList.remove("empty");

  avatarContainer.style.animation = "none";
  avatarContainer.innerHTML = "";
  avatarContainer.appendChild(playerAvatarElement);
  playerNameContainer.textContent = name;
  playerNameContainer.style.color = "black";
  hostConatiner.textContent = isHost ? "(HOST)" : "";
};

const updateRoom = () => {
  const playerContainers = document.querySelectorAll(".player-container");

  playerContainers.forEach((container) => {
    const avatarContainer = container.querySelector(".player-avatar");
    const playerNameContainer = container.querySelector(
      ".player-name-container",
    );
    avatarContainer.innerHTML = "";
    playerNameContainer.innerHTML = "";
    container.classList.add("empty");
  });
};

const updatePlayers = (players, lobbyId) => {
  displayRoomId(lobbyId);
  updateRoom();
  players.forEach(renderPlayerCard);
};

const removeStartButton = () => {
  const startButton = document.querySelector("#start-btn");
  if (startButton) {
    startButton.remove();
  }
};

const updateLobby = async (id) => {
  const response = await fetch("/get-lobby-data");

  const { playerDetails, lobbyState, isHost, data } = await response.json();
  if (response.status === 200) {
    updatePlayers(playerDetails, data.id);
  }

  if (
    lobbyState === LOBBY_STATES.IN_GAME
  ) {
    return startGame(id);
  }

  if (lobbyState === LOBBY_STATES.READY && isHost) {
    return addStartButton(id);
  }

  if (lobbyState === LOBBY_STATES.WAITING && isHost) {
    return removeStartButton();
  }
};

const leaveLobby = async (_event) => {
  const response = await fetch("/leave-lobby", { method: "post" });
  const { action, data } = await response.json();
  if (action === "LEAVE" && data.success) {
    return (globalThis.location = "/");
  }
};

const addListenerToLeave = () => {
  const leaveButton = document.querySelector("#leave-button");
  leaveButton.addEventListener("click", leaveLobby);
};

const main = () => {
  updateLobby();
  setInterval(() => {
    updateLobby();
  }, 2000);

  addListenerToLeave();
};

globalThis.onload = main;
