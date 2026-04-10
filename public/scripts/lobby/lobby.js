export const renderAvatar = (name) => {
  const avatar = document.createElement("playful-avatar");
  avatar.setAttribute("name", name);
  avatar.setAttribute("variant", "bauhaus");
  avatar.setAttribute("color", "#e8d5b7,#0e2430,#fc3a51,#f5b349,#e8d5b9");
  return avatar;
};

const displayRoomId = (lobbyId) => {
  const roomId = document.querySelector("#room-id");
  roomId.textContent = lobbyId;
};

const startQuickGame = (id) => {
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

const startHostGame = (id) => {
  const startButton = document.querySelector("#start-btn");

  if (!startButton) {
    const startBtn = renderStartButton();
    startBtn.addEventListener("click", async () => {
      const res = await fetch("/start-game").then((x) => x.json());
      if (!res.ok) return;
      globalThis.location = "/game.html";
      clearInterval(id);
      return;
    });
  }
};

const renderPlayerCard = (name, id) => {
  const playerContainer = document.querySelector(`#player-${id + 1}`);
  const avatarContainer = playerContainer.querySelector(".player-avatar");
  const playerNameContainer = playerContainer.querySelector(
    ".player-name-container",
  );
  const avatar = renderAvatar(name);

  avatarContainer.style.animation = "none";
  avatarContainer.innerHTML = "";
  avatarContainer.appendChild(avatar);
  playerNameContainer.textContent = name;
  playerNameContainer.style.color = "black";
};

const updatePlayers = (players, lobbyId) => {
  displayRoomId(lobbyId);

  players.forEach(renderPlayerCard);
};

const updateLobby = async (id, nav) => {
  const response = await fetch("/get-lobby-data");

  const { playerDetails, data, isHost } = await response.json();
  if (response.status === 200) {
    updatePlayers(playerDetails, data.id);
  }

  if (
    data.status === "in-game" && data.roomType === "public" ||
    (data.status === "game-started")
  ) {
    return startQuickGame(id);
  }

  if (data.status === "in-game" && isHost) {
    return startHostGame(id);
  }
  if (data.status !== "in-game" && isHost) {
    return nav.textContent = "";
  }
};

const leaveLobby = async (_event) => {
  const response = await fetch("/leave-lobby", { method: "post" });
  const { action, data } = await response.json();
  if (action === "LEAVE" && data.success) {
    return globalThis.location = "/";
  }
};

const addListenerToLeave = () => {
  const leaveButton = document.querySelector("#leave-button");
  leaveButton.addEventListener("click", leaveLobby);
};

const main = () => {
  const nav = document.querySelector("#navigations");
  updateLobby("", nav);
  const id = setInterval(() => {
    updateLobby(id, nav);
  }, 2000);

  addListenerToLeave();
};

globalThis.onload = main;
