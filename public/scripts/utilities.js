export const longPoll = async (api) => {
  const res = await fetch(api);
  if (res.status === 204) {
    return longPoll(api);
  }
  return res.json();
};
