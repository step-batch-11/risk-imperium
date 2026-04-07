export const sendDataToPlayer = (player, state, updates) => {
  if (!player) {
    return;
  }
  const resolver = player.resolver;
  if (resolver) {
    resolver({ state, updates });
  }
};

export const sendUpdatesToPlayers = (state, updates, players) => {
  players.forEach((player) => sendDataToPlayer(player, state, updates));
};
