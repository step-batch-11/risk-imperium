import { leaveGame } from "../server_calls.js";

export const initLeaveGame = () => {
  const exitBtn = document.querySelector("#exit-game-btn");
  const dialog = document.querySelector("#exit-confirm-dialog");
  const confirmBtn = dialog.querySelector("#exit-confirm-btn");
  const cancelBtn = dialog.querySelector("#exit-cancel-btn");

  exitBtn.addEventListener("click", () => dialog.showModal());

  cancelBtn.addEventListener("click", () => dialog.close());

  confirmBtn.addEventListener("click", async () => {
    const { success } = await leaveGame();
    if (success) {
      window.location.href = "/";
    }
  });
};
