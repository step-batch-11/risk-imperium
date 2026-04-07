export const sendDataToPlayer = (player, state, updates) => {
  if (!player) {
    return;
  }
  const resolver = player.resolver;
  if (resolver) {
    resolver({ state, updates });
    console.log(player.name);
  }
};

export const sendUpdatesToPlayers = (state, updates, players) => {
  players.forEach((player) => sendDataToPlayer(player, state, updates));
};
