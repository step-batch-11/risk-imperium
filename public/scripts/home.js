import { sendPostRequest } from "./server_calls.js";

const joinRoomBtn = document.querySelector("#join-room-btn");
const actionsPanel = document.querySelector("#actions-panel");
const joinForm = document.querySelector("#join-room");

joinRoomBtn.addEventListener("click", () => {
  actionsPanel.classList.add("disable-join");
  joinForm.classList.toggle("disable-join");
});

const form = document.querySelector("#join-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const roomId = formData.get("roomId");

  const response = await sendPostRequest("/join-room", { roomId });
  console.log(response);
  if (response.success) {
    globalThis.location = "/lobby.html";
  }

  console.log("invalid roomid");
});
