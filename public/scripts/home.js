import { sendPostRequest } from "./server_calls.js";

const joinRoomBtn = document.querySelector("#join-room-btn");
const actionsPanel = document.querySelector("#actions-panel");
const joinForm = document.querySelector("#join-room");

joinRoomBtn.addEventListener("click", () => {
  actionsPanel.classList.add("disable-join");
  joinForm.classList.toggle("disable-join");
  const input = document.querySelector("#join-form input");
  input.focus();
});

const form = document.querySelector("#join-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const roomId = formData.get("roomId");

  const response = await sendPostRequest("/join-room", { roomId });

  if (response.success) {
    globalThis.location = "/lobby.html";
    return;
  }

  form.reset();
  invalidRoomIdNotification("Room is not available..");
});

const invalidRoomIdNotification = (message, type = "info", duration = 2000) => {
  let notifyTimer = 0;

  const notification = document.querySelector("#notification-container");
  notification.className = `notification ${type}`;
  const paragraph = notification.querySelector("#notification-text");
  paragraph.textContent = message;

  clearTimeout(notifyTimer);

  notifyTimer = setTimeout(() => {
    notification.classList.remove(type);
  }, duration);
};
