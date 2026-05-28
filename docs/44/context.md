## Context Summary: Issue #44 — [31] - Leave game

### Issue

- **State:** Open
- **Labels:** None
- **Milestone:** None

### What the issue asks for

A player in an active game must be able to voluntarily exit at any time.
Clicking an "Exit" button shows a confirmation dialog; confirming removes them
from the game, takes them to the home screen (`/`), and broadcasts the departure
to remaining players; cancelling keeps them in the game with no change.

### Linked issues

| # | Title      | Relationship | State |
| - | ---------- | ------------ | ----- |
| — | None found | —            | —     |

### Images

| File | What it shows      |
| ---- | ------------------ |
| —    | No images attached |

### Codebase findings

| Area                   | Detail                                                                                                                                                                                                                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Repo structure         | Deno + Hono server; all state in-memory Maps; vanilla JS frontend; no build step                                                                                                                                                                                                                                                                 |
| Backend entry          | `src/app.js` — all routes defined here; new route must be added here                                                                                                                                                                                                                                                                             |
| Relevant backend files | `src/game.js` — `eliminatePlayer(id)` removes player and adjusts active index; `src/handlers/passivePlayers.js` — `broadCastNewUpdates(players)` notifies waiting players; `src/handlers/auth.js` — `logoutHandler` clears all cookies; `src/handlers/lobby/lobby_handler.js` — `leaveLobbyHandler` is the pattern to follow for a leave handler |
| Missing backend        | No `POST /leave-game` endpoint exists; no `leaveGame` service exists                                                                                                                                                                                                                                                                             |
| Cookie model           | Three cookies: `playerId` (identity), `gameId` (in-game), `lobbyId` (in-lobby). Leaving a game must clear `gameId` (and `game-version`)                                                                                                                                                                                                          |
| Frontend entry         | `public/game.html` — `#bottom-panel > .action-menu` contains existing action buttons (Players, Cards, Theme); Exit button belongs here                                                                                                                                                                                                           |
| Frontend pattern       | `<dialog>` element used for troop-deploy confirm in `game.html`; same pattern for exit confirm dialog                                                                                                                                                                                                                                            |
| Notification system    | `public/scripts/utilities/notifications.js` — `showNotification(msg, type, duration)`                                                                                                                                                                                                                                                            |
| Server calls           | `public/scripts/server_calls.js` — exports `sendPostRequest(url, data)`; new `leaveGame()` export needed                                                                                                                                                                                                                                         |
| State machine          | `SETUP_TRANSITION` in `transition_handlers.js` maps game states to handlers; no change needed for the leaving player (they redirect), but remaining players will receive an update via polling                                                                                                                                                   |
| Test framework         | Deno `@std/testing/bdd` (`describe`/`it`); tests call `createApp(...)` directly or mock context objects with `{ get, req, json }`                                                                                                                                                                                                                |
| Existing similar test  | `test/handler_test.js` — `describe("Logout tests")` shows mock-context pattern for auth handlers                                                                                                                                                                                                                                                 |

### Initial observations

1. **`eliminatePlayer(id)` already exists on `Game`** — it removes the player
   from `#players`, transfers their cards to the attacker (inapplicable here),
   and adjusts `#activePlayerIndex`. For voluntary leave, we should call it or
   add a similar `removePlayer(id)` that skips card transfer.

2. **`broadCastNewUpdates(game.players)`** in `passivePlayers.js` wakes all
   long-poll requests — calling this after removing the player ensures remaining
   players get an update immediately.

3. **`handleWaiting` already handles the "not in game" case** — if a player is
   no longer in `game.players`, it clears `gameId`/`lobbyId` cookies and returns
   `{ action: STATES.ELIMINATED }`. Remaining players will receive the next game
   state on their next poll without any extra logic.

4. **If the leaving player is the active player**, `eliminatePlayer` adjusts
   `#activePlayerIndex` so the next player's turn starts correctly. We must also
   advance the turn state (set to `REINFORCE` for next player) if the current
   state is mid-turn.

5. **The `leaveLobbyHandler` is the structural pattern** to follow for
   `leaveGameHandler`: read cookies, find entity, mutate state, delete cookies,
   return JSON.

6. **Frontend confirm dialog** — `game.html` already has a
   `<dialog id="deploy-troops-container">` showing the native `<dialog>`
   approach used in the project. A new `<dialog id="exit-confirm-dialog">` with
   confirm/cancel buttons is the consistent pattern.
