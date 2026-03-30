import { sendPostRequest } from "../server_calls.js";
import { updateTroopCount } from "../utilities.js";

export const handleInitialReinforcement = async (territory, gameState) => {
  const territoryId = Number(territory.dataset.territoryId);
  const reqData = {
    userActions: "REINFORCE",
    data: { territoryId, troopCount: 1 },
  };
  const { action, data } = await sendPostRequest("/user-actions", reqData);
  gameState.state = action;
  updateTroopCount(territory, data);
};
