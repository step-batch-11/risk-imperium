import { APIs } from "../APIS.js";
import { sendPostRequest } from "../server_calls.js";
import { USER_ACTIONS } from "../user_action.js";

const openDialogBox = (territoryId) => {
  const dialog = document.querySelector("dialog");
  dialog.showModal();

  const form = dialog.querySelector("#deploy-troops-form");
  form.onsubmit = async (e) => {
    e.preventDefault();
    const input = form.querySelector("input");
    const troopCount = input.value;

    const reqData = {
      userActions: USER_ACTIONS.REINFORCE,
      data: { territoryId, troopCount: Number(troopCount) },
    };

    await sendPostRequest(APIs.USER_ACTIONS, reqData);
    form.reset();
    dialog.close();
  };
};

export const onMapAction = (event) => {
  const territory = event.target.closest("g");
  const territoryId = Number(territory.dataset.territoryId);

  openDialogBox(territoryId);
};
