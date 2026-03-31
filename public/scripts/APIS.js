export const APIs = {
  SETUP: "/setup",
  USER_ACTIONS: "/user-actions",
  GET_GAME_STATE: "/get-game-state",
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
    userActions: "COMBAT",
    data,
  };

  return await sendPostRequest(APIs.USER_ACTIONS, reqData);
};

// export const getGameState = async () => {
//   return await fetch(APIs.GET_GAME_STATE).then((res) => res.json());
// };
