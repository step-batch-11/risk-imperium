export const SAVED_STATES_GAMES = {
  "start-no-setup": (_game) => {
  },
  "start": (game) => {
    game.initTerritories();
  },
  "init-reinforced": (game) => {
    const rawStateData = Deno.readTextFileSync(
      "./data/states/init-reinforced.json",
    );
    const state = JSON.parse(rawStateData);
    game.loadGameState(state);
  },
};
