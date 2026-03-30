const USER_ACTIONS = {
  "REINFORCE": (game, data) => game.reinforce(data),
};

export const handleUserActions = async (context) => {
  try {
    const game = context.get("game");
    const { userActions, data } = await context.req.json();

    const actionToPerform = USER_ACTIONS[userActions];
    const result = actionToPerform(game, data);
    return context.json(result);
  } catch (e) {
    return context.json({ msg: e.message }, 500);
  }
};
