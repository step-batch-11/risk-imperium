import { sendPostRequest } from "./server_calls.js";

export const APIs = {
  SETUP: "/setup",
  USER_ACTIONS: "/user-actions",
  GET_GAME_STATE: "/get-game-state",
};

export const invade = async (invasionDetails) => {
  const reqData = { userActions: "INVADE", data: invasionDetails };
  try {
    return await sendPostRequest("/user-actions", reqData);
  } catch (e) {
    console.log(e);
  }
};

export const reinforce = async (data) => {
  const reqData = {
    userActions: "REINFORCE",
    data,
  };
  return await sendPostRequest(APIs.USER_ACTIONS, reqData);
};

export const defend = async (data) => {
  const reqData = {
    userActions: "DEFEND",
    data,
  };
  return await sendPostRequest(APIs.USER_ACTIONS, reqData);
};

export const combat = async (data) => {
  const reqData = {
    userActions: "RESOLVE_COMBAT",
    data,
  };

  return await sendPostRequest(APIs.USER_ACTIONS, reqData);
};
