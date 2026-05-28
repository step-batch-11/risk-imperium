# Architecture

## Request Lifecycle

```
Browser
  └─▶ main.js                    bootstrap: wires stores, starts Deno.serve
        └─▶ src/app.js           Hono app: injects stores into context, defines all routes
              └─▶ src/middle_ware.js   guards: auth checks, state-based redirects
                    └─▶ src/handlers/  parse request, delegate to service
                          └─▶ src/services/  business logic for each game phase
                                └─▶ src/game.js  mutate Game state, return result
```

## Layers

### `main.js` — Bootstrap

Creates the three in-memory stores and passes them into `createApp`:

```js
const players = {}; // playerId → playerName
const lobbies = new Map(); // lobbyId  → Lobby
const gamesRepo = new Map(); // gameId   → Game
```

Also passes Deno IO primitives (`readTextFile`, `writeTextFileSync`) and the
Hono logger so they can be injected/swapped in tests.

### `src/app.js` — Routing

Defines every route with its middleware chain. Stores are injected into Hono
context via a top-level `app.use`. Dev-only routes (`/load/:state`,
`/save/:name`, `/dev`, `/dev/login`) are registered only when `isDevMode` is
true.

### `src/middle_ware.js` — Guards

Five middleware functions; each reads cookies and redirects or calls `next()`:

| Middleware               | What it does                                                                      |
| ------------------------ | --------------------------------------------------------------------------------- |
| `rejectUnknownUser`      | Redirects to `/login.html` if `playerId` not in `players`                         |
| `redirectLoggedInPlayer` | Redirects logged-in users away from `/login.html`                                 |
| `rejectIfNotInGame`      | Redirects to `/` if `gameId` not in `gamesRepo`                                   |
| `redirectInGamePlayer`   | Redirects in-game players to `/game.html`                                         |
| `redirectInLobbyPlayer`  | Redirects lobbied players to `/lobby.html`                                        |
| `setGame`                | Resolves `gameId` cookie → `Game` instance; sets `game` and `playerId` on context |

### `src/handlers/` — HTTP Handlers

Thin layer: parse request body/params, call the appropriate service, return
JSON. Key files:

- `auth.js` — login / logout
- `user_actions.js` — in-game player actions (delegates to `gameController`)
- `passivePlayers.js` — polling endpoint for non-active players (`/get-data`)
- `invasion_controller.js` — orchestrates combat (invade + defend flow)
- `lobby/lobby_handler.js` — create room, join room, start game, leave lobby

### `src/services/` — Business Logic

One file per game phase or concern:

| File                    | Responsibility                          |
| ----------------------- | --------------------------------------- |
| `setup_service.js`      | Initial troop placement                 |
| `setup_reinforce.js`    | Early-game reinforcement                |
| `reinforcement.js`      | Per-turn troop allocation               |
| `invade.js`             | Attack initiation                       |
| `defend.js`             | Defender response                       |
| `capture.js`            | Territory capture after win             |
| `resolve_combat.js`     | Dice rolling and troop loss calculation |
| `fortification.js`      | End-of-turn troop movement              |
| `skip_invasion.js`      | Skip attack phase                       |
| `skip_fortification.js` | Skip fortify phase                      |
| `card_service.js`       | Card draw and trade-in                  |
| `get_move_in_data.js`   | Serialize game state for client polling |

### `src/game.js` — Game State Machine

The `Game` class is the single source of truth. All fields are private (`#`).
Exposes phase-transition methods consumed by services. See `game-logic.md` for
state machine details.

### `src/models/` — Entities

Pure data classes with no HTTP concerns: `Player`, `Territory`, `Continents`,
`Cards`, `Cavalry`.

### `src/config.js` — Board Data

Contains the `STATES` enum and the complete Risk territory adjacency graph used
throughout the game logic.

## Frontend (`/public`)

Pages: `index.html`, `login.html`, `lobby.html`, `game.html`, `dev.html`

Client scripts in `/public/scripts/`:

- `main.js` — initializes page on load
- `server_calls.js` — all fetch calls to the backend
- `listeners.js` — wires DOM events
- `features/` — one module per game-phase UI
- `handlers/` — event handler callbacks
- `utilities/` — shared helpers

No build step, no bundler — files are served as-is via Hono's `serveStatic`.

## Tests (`/test`)

- Mirror `src/` structure: `game_test.js`, `handler_test.js`, `app_test.js`,
  `services/`, `model_test/`
- BDD style via `@std/testing/bdd` (`describe` / `it`)
- `test/utilities.js` — shared helpers (create test game, mock players, etc.)
- `data/tests/` — JSON snapshots of mid-game states used as fixtures for
  reproducible service tests
