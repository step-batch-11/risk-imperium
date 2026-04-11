const sounds = {
  roll: () => {
    const audio = new Audio("assets/dice-roll.mpeg");
    audio.currentTime = 2.7;
    audio.volume = 0.2;
    return audio;
  },

  notification: new Audio("assets/turnStart.wav"),
  defend: new Audio("assets/defend.mp3"),
};

export const SFX = {
  DICE_ROLL: sounds.roll,
  TURN: sounds.notification,
  DEFEND: sounds.defend,
};
