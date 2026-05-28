# Tasks: [31] - Leave game (#44)

## Task 1: Add `removePlayer(id)` to the `Game` class

**Description** Add a public `removePlayer(playerId)` method to `src/game.js`.
It removes the player from `#players`, adjusts `#activePlayerIndex` if needed,
and if the removed player was the active player, calls `passToNextPlayer()` to
advance to the next player's `REINFORCE` phase. Does **not** transfer cards
(unlike `eliminatePlayer`). Returns early with no-op if the player is not found
(idempotent guard against double-calls). Also calls
`updateGame('LEAVE', {}, playerId)` so `lastUpdate` carries the departure for
remaining players' notifications.

**Acceptance Criteria**

- [ ] `game.removePlayer(id)` removes the player from the internal players array
- [ ] When a non-active player leaves, `activePlayerIndex` and game state are
      unchanged
- [ ] When the active player leaves, the game advances to the next player's
      `REINFORCE` phase
- [ ] Calling `removePlayer` with an unknown ID is a safe no-op
- [ ] `game.lastUpdate` is set to `{ action: 'LEAVE', data: {}, playerId }`
      after removal
- [ ] Unit tests cover all four scenarios above

**Files Likely Affected**

- `src/game.js` — add `removePlayer(id)` method
- `test/game_test.js` — new `describe("removePlayer")` block

**Test Requirements**

- Unit: mock a 3-player game; remove a non-active player → active player
  unchanged
- Unit: remove the active player → active player rotates to next; state is
  `REINFORCE`
- Unit: remove unknown ID → players array unchanged
- Unit: `lastUpdate.action === 'LEAVE'` after removal

**Dependencies**

- None

**Estimated Complexity** S

---

## Task 2: `leaveGameHandler` + `POST /leave-game` route

**Description** Create `src/handlers/leave_game.js` exporting
`leaveGameHandler`. It reads `playerId` from the Hono context, calls
`game.removePlayer(playerId)`, calls `broadCastNewUpdates(game.players)` to wake
remaining long-polls, deletes `gameId` and `game-version` cookies, and returns
`{ success: true }`. Register the route in `src/app.js` with middleware chain
`rejectUnknownUser → rejectIfNotInGame → setGame → leaveGameHandler`.

**Acceptance Criteria**

- [ ] `POST /leave-game` with valid cookies removes the player from the game and
      returns `{ success: true }`
- [ ] `gameId` and `game-version` cookies are cleared in the response;
      `playerId` cookie is retained
- [ ] Remaining players in `game.players` have their `resolve` callbacks fired
      (broadcast)
- [ ] Calling the endpoint when the player is already gone returns
      `{ success: false }` (no crash)
- [ ] Route is protected: unknown user → redirect `/login.html`; not in game →
      redirect `/`
- [ ] Handler unit test using mock context; integration test via
      `createApp(...).request(...)`

**Files Likely Affected**

- `src/handlers/leave_game.js` — new file
- `src/app.js` — import and register `POST /leave-game`
- `test/handler_test.js` — new `describe("leaveGameHandler")` block

**Test Requirements**

- Unit: mock context with `game.removePlayer`, `broadCastNewUpdates` — verify
  cookie deletion and response
- Integration:
  `app.request('/leave-game', { method: 'POST', headers: { cookie: 'playerId=1;gameId=1' } })`
  → 200, `{ success: true }`, cookies cleared

**Dependencies**

- Depends on Task 1 (`game.removePlayer` must exist)

**Estimated Complexity** M

---

## Task 3: Exit button + confirm dialog in `game.html`

**Description** Add an Exit button to `#bottom-panel > .action-menu` in
`public/game.html`, matching the style of existing action buttons (Players,
Cards, Theme). Add a native `<dialog id="exit-confirm-dialog">` with two
buttons: "Confirm" (id `exit-confirm-btn`) and "Cancel" (id `exit-cancel-btn`).
No JS wiring in this task — HTML only.

**Acceptance Criteria**

- [ ] Exit button appears in the action menu alongside Players, Cards, Theme
- [ ] Exit button has consistent markup and class (`action-btn`) as the other
      buttons
- [ ] `<dialog id="exit-confirm-dialog">` exists in the DOM with confirm and
      cancel buttons
- [ ] Dialog is closed by default (no `open` attribute)
- [ ] No JS errors on page load from these additions

**Files Likely Affected**

- `public/game.html` — add button to `.action-menu`; add `<dialog>` to
  `#overlay-panel`

**Test Requirements**

- Visual: button visible in action bar, dialog hidden by default
- No automated test needed for static HTML; covered by Task 4's integration

**Dependencies**

- None (independent of backend tasks)

**Estimated Complexity** S

---

## Task 4: Frontend JS — leave-game feature module + wiring

**Description** Add `leaveGame()` to `public/scripts/server_calls.js`. Create
`public/scripts/features/leave_game.js` that exports `initLeaveGame()`: wires
the Exit button to open `#exit-confirm-dialog`; wires the Confirm button to call
`leaveGame()` and on success redirect to `/`; wires Cancel to close the dialog.
Import and call `initLeaveGame()` in `public/scripts/main.js`.

**Acceptance Criteria**

- [ ] Clicking Exit opens the confirm dialog
- [ ] Clicking Cancel closes the dialog; player remains on game screen with no
      state change
- [ ] Clicking Confirm calls `POST /leave-game`; on `{ success: true }` the
      browser navigates to `/`
- [ ] `leaveGame()` is exported from `server_calls.js` and uses
      `sendPostRequest('/leave-game', {})`
- [ ] `initLeaveGame()` is called once during `globalThis.onload` in `main.js`

**Files Likely Affected**

- `public/scripts/server_calls.js` — add `leaveGame()`
- `public/scripts/features/leave_game.js` — new file
- `public/scripts/main.js` — import and call `initLeaveGame()`

**Test Requirements**

- No automated unit test for DOM wiring (frontend-only, no test harness)
- Manual: open game, click Exit → dialog appears; Cancel → dialog closes;
  Confirm → redirected to `/`

**Dependencies**

- Depends on Task 3 (HTML elements must exist)
- Depends on Task 2 (endpoint must exist for the confirm flow to succeed)

**Estimated Complexity** S
