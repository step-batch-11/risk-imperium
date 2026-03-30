import { APIs } from "./APIS.js";

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
