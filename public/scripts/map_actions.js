import { sendPostRequest } from "./server_calls.js";

const openDialogBox = (tid) => {
  const dialog = document.querySelector('dialog');
  dialog.showModal();

  const form = dialog.querySelector('#deploy-troops-form');
  form.onsubmit = async (e) => {
    e.preventDefault()
    const input = form.querySelector('input');
    const troopCount = input.value
    const reqData = { userActions: "REINFORCE", data: { tid: tid, troopCount: Number(troopCount) } };
    const response = await sendPostRequest('/user-actions', reqData);
    form.reset();
    console.log(response)
    dialog.close();
  }
}

export const onMapAction = (event) => {
  const territory = event.target.closest('g');
  const tid = Number(territory.dataset.tid);

  openDialogBox(tid);
}