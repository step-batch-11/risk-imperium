import { APIs } from "./configs/APIS.js";
import { USER_ACTIONS } from "./configs/user_action.js";

export const getSetup = async () => {
  try {
    const res = await fetch(APIs.SETUP);
    return res.json();
  } catch (e) {
    console.log(e);
    return {};
  }
};

export const sendPostRequest = (url, reqData = {}) =>
  fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(reqData),
  }).then((data) => data.json());

export const updateGameState = (url) => fetch(url).then((data) => data.json());
export const invade = async (invasionDetails) => {
  const reqData = { userActions: USER_ACTIONS.INVADE, data: invasionDetails };
  try {
    return await sendPostRequest("/user-actions", reqData);
  } catch (e) {
    console.log(e);
  }
};
export const sendReinforceRequest = async (data) => {
  const reqData = {
    userActions: USER_ACTIONS.REINFORCE,
    data,
  };
  return await sendPostRequest(APIs.USER_ACTIONS, reqData);
};
export const defend = async (data) => {
  const reqData = {
    userActions: USER_ACTIONS.DEFEND,
    data,
  };
  return await sendPostRequest(APIs.USER_ACTIONS, reqData);
};
export const combat = async (data) => {
  const reqData = {
    userActions: USER_ACTIONS.RESOLVE_COMBAT,
    data,
  };

  return await sendPostRequest(APIs.USER_ACTIONS, reqData);
};

export const skipFortificationRequest = async () => {
  const reqData = {
    userActions: USER_ACTIONS.SKIP_FORTIFICATION,
    data: [],
  };
  return await sendPostRequest(APIs.USER_ACTIONS, reqData);
};
