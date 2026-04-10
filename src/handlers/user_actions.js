import { STATES } from "../config.js";
import { getCardService, tradeCardService } from "../services/card_service.js";

import { deleteCookie, setCookie } from "hono/cookie";
import { reinforcementsServices } from "../services/reinforcement.js";

import { setupService } from "../services/setup_service.js";
import { getMoveInDataService } from "../services/get_move_in_data.js";
import { fortificationService } from "../services/fortification.js";
import { skipFortificationService } from "../services/skip_fortification.js";
import { skipInvasionService } from "../services/skip_invasion.js";
import { captureService } from "../services/capture.js";
import { invadeService } from "../services/invade.js";
import { defendService } from "../services/defend.js";
import { resolveCombatService } from "../services/resolve_combat.js";
import { broadCastNewUpdates } from "./passivePlayers.js";

export const USER_ACTIONS = {
  REINFORCE: reinforcementsServices,
  SETUP: setupService,
  GET_MOVE_IN_DATA: getMoveInDataService,
  GET_CARD: getCardService,
  TRADE_CARD: tradeCardService,
  FORTIFICATION: fortificationService,
  SKIP_FORTIFICATION: skipFortificationService,
  SKIP_INVASION: skipInvasionService,
  INVADE: invadeService,
  DEFEND: defendService,
  RESOLVE_COMBAT: resolveCombatService,
  CAPTURE: captureService,
};

const gameService = (userActions, game, data) => {
  const actionToPerform = USER_ACTIONS[userActions];

  const players = game.players;

  const activePlayerId = game.activePlayerId;
  const opponents = players.filter((player) => player.id !== activePlayerId);

  const result = actionToPerform(game, data, activePlayerId, opponents);

  broadCastNewUpdates(players);
  return result;
};

export const gameController = async (
  context,
  _next,
  setCookieFn = setCookie,
) => {
  try {
    const game = context.get("game");
    const { userActions, data } = await context.req.json();

    const result = gameService(userActions, game, data);

    if (result.action === STATES.WON) {
      deleteCookie(context, "gameId");
      deleteCookie(context, "lobbyId");
    }
    const gameVersion = game.version;
    setCookieFn(context, "game-version", gameVersion);

    return context.json(result);
  } catch (e) {
    console.log(e);

    return context.json({ msg: e.message }, 500);
  }
};
