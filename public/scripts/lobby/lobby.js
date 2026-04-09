export const renderAvatar = (name) => {
  const avatar = document.createElement("playful-avatar");
  avatar.setAttribute("name", name);
  avatar.setAttribute("variant", "bauhaus");
  avatar.setAttribute("color", "#e8d5b7,#0e2430,#fc3a51,#f5b349,#e8d5b9");
  return avatar;
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

const updatePlayers = (container, players) => {
  const fragment = document.createDocumentFragment();
  const playerTemplate = document.querySelector("#player-template");
  players.forEach((player) =>
    fragment.appendChild(createPlayerElement(player, playerTemplate))
  );
  container.replaceChildren(fragment);
};

const updateLobby = async (playerContainer, id) => {
  const response = await fetch("/get-lobby-data");
  const data = await response.json();
  if (response.status === 200) {
    updatePlayers(playerContainer, data.playerList);
  }
  if (data.start) {
    globalThis.location = "/game.html";
    clearInterval(id);
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
  const playersContainer = document.querySelector("#players-container");
  updateLobby(playersContainer);
  const id = setInterval(() => {
    updateLobby(playersContainer, id);
  }, 2000);

  addListenerToLeave();
};

globalThis.onload = main;
