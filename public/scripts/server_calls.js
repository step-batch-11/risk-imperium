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
