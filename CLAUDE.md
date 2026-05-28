# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Risk Imperium is a multiplayer Risk board game server built with **Deno** and the **Hono** web framework. The frontend is vanilla JavaScript with HTML/CSS. Game state is managed entirely in-memory (no database).

## Commands

```bash
deno task dev          # Start server with watch mode (enables DEV_MODE)
deno task start        # Start server with watch mode
deno task test         # Run all tests
deno task test:watch   # Run tests in watch mode
deno task coverage     # Generate coverage report
deno task lint         # Lint and auto-fix
```

Run a single test file:
```bash
deno test test/game_test.js --allow-read --allow-write
```

Setup git hooks (pre-commit lint, pre-push checks):
```bash
./setup.sh
```

## Architecture

### Request Lifecycle
`main.js` → `src/app.js` (Hono routing + middleware) → `src/middle_ware.js` (auth, session, state-based routing) → `src/handlers/` → `src/services/`

### Backend Layers (`/src`)

- **`app.js`** — Hono app setup, all route definitions, static file serving
- **`middle_ware.js`** — Cookie-based auth, redirects players based on game state (lobby vs. in-game)
- **`handlers/`** — HTTP request handlers (`auth.js`, `user_actions.js`, `passivePlayers.js`, `invasion_controller.js`, `lobby/lobby_handler.js`)
- **`services/`** — Business logic per game phase: `invade.js`, `defend.js`, `capture.js`, `fortification.js`, `reinforcement.js`, `card_service.js`, `setup_service.js`, `resolve_combat.js`
- **`models/`** — Core entities: `player.js`, `territory.js`, `continents.js`, `cards.js`, `cavalry.js`
- **`game.js`** — Central game state machine; holds all state and exposes phase-transition methods
- **`create_game.js`** — Factory for game instances
- **`config.js`** — Risk board territory graph and adjacency data

### State Machine
The game cycles through discrete phases managed in `game.js`: `SETUP → REINFORCE → INVADE → FORTIFY → (next player's REINFORCE)`. Each phase has a dedicated service module. The `middle_ware.js` uses current game state to route requests appropriately.

### In-Memory Storage
All state lives in JavaScript `Map` objects (no DB):
- `gamesRepo` — active game instances
- `lobbies` — lobby rooms and their players  
- `players` — player sessions keyed by cookie ID

### Dev Mode
Setting `DEV_MODE='true'` (done automatically by `deno task dev`) enables:
- `/dev` page with manual game state controls
- JSON save/load endpoints backed by `data/states/`
- Dev login bypassing normal auth

### Frontend (`/public`)
Pages: `index.html`, `login.html`, `lobby.html`, `game.html`, `dev.html`

Client scripts in `/public/scripts/`: `main.js` (init), `server_calls.js` (API), `listeners.js` (events), `features/` (game phase UI modules), `handlers/` (event handlers), `utilities/` (helpers).

### Tests (`/test`)
Tests use Deno's `@std/testing/bdd` (describe/it). JSON fixtures in `data/tests/` provide reproducible game states. `test/utilities.js` has shared test helpers.
