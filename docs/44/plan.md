# Plan: [31] - Leave game (#44)

## Status: Completed

Implemented in 4 tasks. All tests passing. Final commit: 95e9ff9.

## Objective

A player in an active game can click an "Exit" button at any time, confirm their
intent in a dialog, and be removed from the game — their cookies cleared,
redirected to `/`. Remaining players receive an immediate notification and the
game continues. Cancelling the dialog leaves the player in the game with no side
effects.

## Scope

### In Scope

- Exit button in `game.html` bottom action bar
- Native `<dialog>` confirm/cancel UI (consistent with existing deploy-troops
  dialog)
- `POST /leave-game` Hono endpoint guarded by `rejectUnknownUser` +
  `rejectIfNotInGame` + `setGame`
- New `leaveGameHandler` in `src/handlers/leave_game.js`
- New `removePlayer(id)` method on `Game` (like `eliminatePlayer` but without
  card transfer)
- Broadcast to remaining players via `broadCastNewUpdates`
- Auto-advance turn if the leaving player was active
- Clear `gameId` + `game-version` cookies on the leaving player; redirect to `/`
- Frontend `leaveGame()` call in `server_calls.js` + `leave_game.js` feature
  module
- Tests: handler unit test + app integration test for the new endpoint

### Out of Scope

- Lobby leave (already implemented in `leaveLobbyHandler`)
- Special win declaration when only 1 player remains
- Territory redistribution on leave
- Rejoin mechanic

## Approach

### Backend

**1. New `Game#removePlayer(playerId)`** in `src/game.js` Mirrors
`eliminatePlayer` but skips card transfer (the leaving player keeps nothing).
Removes the player from `#players`, adjusts `#activePlayerIndex` if needed. If
the removed player was the active player, call `passToNextPlayer()` to advance
to the next player's `REINFORCE` phase.

**2. New `src/handlers/leave_game.js`** Reads `playerId` and `gameId` from
cookies. Calls `game.removePlayer(playerId)`. Calls
`broadCastNewUpdates(game.players)` to wake remaining long-poll requests.
Deletes `gameId` and `game-version` cookies. Returns `{ success: true }`.

**3. Route in `src/app.js`**

```
POST /leave-game  →  rejectUnknownUser, rejectIfNotInGame, setGame, leaveGameHandler
```

### Frontend

**4. Exit button in `public/game.html`** Added to `#bottom-panel > .action-menu`
alongside existing Players/Cards/Theme buttons.

**5. Confirm dialog in `public/game.html`** Native
`<dialog id="exit-confirm-dialog">` with "Confirm" and "Cancel" buttons — same
pattern as `#deploy-troops-container`.

**6. `leaveGame()` in `public/scripts/server_calls.js`**
`sendPostRequest('/leave-game', {})` — follows the pattern of all other server
calls.

**7. `public/scripts/features/leave_game.js`** Wires the Exit button click →
opens dialog. Confirm button → calls `leaveGame()` → on success,
`window.location.href = '/'`. Cancel button → `dialog.close()`.

**8. Wire into `main.js`** Import and call the leave game initialiser on game
page load.

### How remaining players are notified

When `broadCastNewUpdates` fires, each remaining player's long-poll resolves.
The next `getNewUpdates()` call returns their current game state. The
`lastUpdate` field on the game carries `{ action: 'LEAVE', playerId }` so
remaining players see a notification.

## Affected Areas

| Area           | Files / Modules                                         | Change Type                           |
| -------------- | ------------------------------------------------------- | ------------------------------------- |
| Game model     | `src/game.js`                                           | Modify — add `removePlayer(id)`       |
| Handler        | `src/handlers/leave_game.js`                            | Add                                   |
| Router         | `src/app.js`                                            | Modify — register `POST /leave-game`  |
| Server calls   | `public/scripts/server_calls.js`                        | Modify — add `leaveGame()`            |
| Feature module | `public/scripts/features/leave_game.js`                 | Add                                   |
| Game page      | `public/game.html`                                      | Modify — Exit button + confirm dialog |
| Main init      | `public/scripts/main.js`                                | Modify — init leave-game listeners    |
| Tests          | `test/handler_test.js` or new `test/leave_game_test.js` | Add                                   |

## Assumptions

1. [ASSUMPTION] `playerId` cookie is retained after leaving — player stays
   logged in, lands on home screen.
2. [ASSUMPTION] Leaving player's territories remain in the game map under their
   former ID (naturally conquerable by others); no redistribution.
3. [ASSUMPTION] If the leaving player is the active player, the game
   automatically advances to the next player's `REINFORCE`.
4. [ASSUMPTION] No special win condition triggered when only 1 player remains —
   existing `hasPlayerWon()` handles that on the next game action.

## Open Questions (resolved)

| # | Question                                                        | Answer / Decision                                                |
| - | --------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1 | What if only 2 players remain and one leaves?                   | Let existing win-check handle it — out of scope for this story   |
| 2 | What if leaving player is mid-combat (active in INVADE/DEFEND)? | Auto-advance to next player's REINFORCE via `passToNextPlayer()` |
| 3 | Territory distribution on leave?                                | No redistribution — territories remain, become conquerable       |

## Risks & Mitigations

| Risk                                                                 | Mitigation                                                                                               |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Race condition: player leaves mid-combat while defender is resolving | `removePlayer` checks current state and calls `passToNextPlayer()` only if the removed player was active |
| Remaining long-polls not woken                                       | `broadCastNewUpdates` called immediately after removal, before returning response                        |
| Double-leave (player clicks twice before redirect)                   | Handler checks `game.players.find(id)` — if player not found, return early with `{ success: false }`     |
