export const renderAvatar = (name) => {
  const avatar = document.createElement("playful-avatar");
  avatar.setAttribute("name", name);
  avatar.setAttribute("variant", "bauhaus");
  avatar.setAttribute("color", "#e8d5b7,#0e2430,#fc3a51,#f5b349,#e8d5b9");
  return avatar;
};

const displayRoomId = (lobbyId) => {
  const template = document.querySelector("#room-id-template");
  const clone = template.content.cloneNode("true");
  const roomContainer = document.querySelector("#room-id-container");
  const roomElement = clone.querySelector("#room-id");
  roomElement.textContent = `RoomId : ${lobbyId}`;
  roomContainer.replaceChildren(clone);
};

const startQuickGame = (id) => {
  clearInterval(id);
  globalThis.location = "/game.html";
};

const startHostGame = (id) => {
  const startBtn = renderStartButton();
  startBtn.addEventListener("click", async () => {
    await fetch("/start-game");
    globalThis.location = "/game.html";
    clearInterval(id);
    return;
  });
};

const renderStartButton = () => {
  const template = document.querySelector("#game-start-btn");
  const clone = template.content.cloneNode("true");
  const navigationsContainer = document.querySelector("#navigations");
  const startBtn = document.createElement("button");
  startBtn.textContent = "start";
  clone.appendChild(startBtn);
  navigationsContainer.replaceChildren(clone);
  return startBtn;
};

const createPlayerElement = (name, playerTemplate) => {
  const clone = playerTemplate.content.cloneNode(true);
  const playerNameContainer = clone.querySelector(".player-name-container");
  const avatarContainer = clone.querySelector(".player-avatar");
  const avatar = renderAvatar(name);
  avatarContainer.innerHTML = "";
  avatarContainer.appendChild(avatar);
  playerNameContainer.textContent = name;
  return clone;
};

const isHost = (data, playerId) => data.host === Number(playerId.value);

const updatePlayers = (container, players, lobbyId) => {
  displayRoomId(lobbyId);
  const fragment = document.createDocumentFragment();
  const playerTemplate = document.querySelector("#player-template");

  players.forEach((player) => {
    return fragment.appendChild(createPlayerElement(player, playerTemplate));
  });
  container.replaceChildren(fragment);
};

const updateLobby = async (playerContainer, id) => {
  const response = await fetch("/get-lobby-data");
  const playerId = await cookieStore.get("playerId");

  const { playerDetails, data } = await response.json();
  if (response.status === 200) {
    updatePlayers(playerContainer, playerDetails, data.id);
  }

  if (
    data.status === "in-game" && data.roomType === "public" ||
    (data.status === "game-started")
  ) {
    return startQuickGame(id);
  }

  if (data.status === "in-game" && isHost(data, playerId)) {
    return startHostGame(id);
  }

  // if (data.status === "game-started") {
  //   globalThis.location = "/game.html";
  //   clearInterval(id);
  // }
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
  const playersContainer = document.querySelector("#players-container");
  updateLobby(playersContainer);
  const id = setInterval(() => {
    updateLobby(playersContainer, id);
  }, 2000);

  addListenerToLeave();
};

globalThis.onload = main;
