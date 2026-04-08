import * as MSG from "../utilities/notifications.js";
import { STATES } from "./game_states.js";

export const SPECTATOR_MSGs = {
  [STATES.INITIAL_REINFORCEMENT]: MSG.initialReinforcementMsg,
  [STATES.REINFORCE]: MSG.reinforcementMsg,
  [STATES.INVASION]: MSG.invasionMsg,
  [STATES.SKIP_INVASION]: MSG.skipInvasionMsg,
  [STATES.DEFEND]: MSG.defendMsg,
  [STATES.RESOLVE_COMBAT]: MSG.resolveCombatMsg,
  [STATES.MOVE_IN]: MSG.moveInMsg,
  [STATES.FORTIFICATION]: MSG.fortificationMsg,
  [STATES.SKIP_FORTIFICATION]: MSG.skipFortificationMsg,
  [STATES.GET_CARD]: MSG.getCardMsg,
  [STATES.TRADE_CARD]: MSG.tradeCardMsg,
};
