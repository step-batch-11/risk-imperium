export const renderAvatar = (name) => {
  const avatar = document.createElement("img");
  avatar.setAttribute("src", name.img);
  avatar.className = "player-profile";
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
    const res = await fetch("/start-game").then((x) => x.json());
    if (!res.ok) return;
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
  startBtn.className = "startBtn";
  startBtn.textContent = "Start";
  clone.appendChild(startBtn);
  navigationsContainer.replaceChildren(clone);
  return startBtn;
};
const createPlayerElement = (name, avatar, playerTemplate) => {
  const clone = playerTemplate.content.cloneNode(true);
  const playerNameContainer = clone.querySelector(".player-name-container");
  const avatarContainer = clone.querySelector(".player-avatar");
  const playerAvatarElement = renderAvatar(avatar);
  avatarContainer.innerHTML = "";
  avatarContainer.appendChild(playerAvatarElement);
  playerNameContainer.textContent = name;
  return clone;
};

const updatePlayers = (container, players, lobbyId) => {
  displayRoomId(lobbyId);
  const fragment = document.createDocumentFragment();
  const playerTemplate = document.querySelector("#player-template");
  players.forEach(({ name, avatar }) => {
    return fragment.appendChild(
      createPlayerElement(name, avatar, playerTemplate),
    );
  });
  container.replaceChildren(fragment);
};

const updateLobby = async (playerContainer, id) => {
  const response = await fetch("/get-lobby-data");

  const { playerDetails, data, isHost } = await response.json();

  if (response.status === 200) {
    updatePlayers(playerContainer, playerDetails, data.id);
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
  // if (data.status !== "in-game" && isHost) {
  //   return nav.textContent = "";
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
  const nav = document.querySelector("#navigations");
  updateLobby(playersContainer, "", nav);
  const id = setInterval(() => {
    updateLobby(playersContainer, id, nav);
  }, 2000);

  addListenerToLeave();
};

globalThis.onload = main;
