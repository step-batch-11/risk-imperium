export const getOwnedContinents = (player, continents) => {
  return Object.values(continents).filter(continent => {
    continent.territories.every(territory => player.territories.includes(territory));
  });
}

export const longPool = async (api) => {
  const res = await fetch(api);
  if (res.status === 204) {
    return longPool(api);
  }
  return res.json();
};
