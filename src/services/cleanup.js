export const scheduleCleanup = (gamesRepo, gameId) => {
  setTimeout(() => gamesRepo.delete(gameId), 20000);
};
