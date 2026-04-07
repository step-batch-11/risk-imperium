export const renderAvatar = (name) => {
  const avatar = document.createElement("playful-avatar");
  avatar.setAttribute("name", name);
  avatar.setAttribute("variant", "bauhaus");
  avatar.setAttribute("color", "#e8d5b7,#0e2430,#fc3a51,#f5b349,#e8d5b9");
  return avatar;
};

const createPlayerElement = (name) => {
  const profileContainer = document.createElement("div");
  const playerName = document.createElement("div");
  playerName.textContent = name;
  const avatar = renderAvatar(name);
  profileContainer.append(avatar, playerName);

  return profileContainer;
};

const updatePlayers = (container, players) => {
  const fragment = document.createDocumentFragment();
  players.forEach((player) =>
    fragment.appendChild(createPlayerElement(player))
  );
  container.replaceChildren(fragment);
  console.log(container);
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

const main = () => {
  const playerContainer = document.querySelector("#players");
  updateLobby(playerContainer);
  const id = setInterval(() => {
    updateLobby(playerContainer, id);
  }, 2000);
};

globalThis.onload = main;
