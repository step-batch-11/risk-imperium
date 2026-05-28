# Dev Setup

## Prerequisites

- [Deno](https://deno.com/) v2.7.5+
- No `npm install` — Deno resolves dependencies from `deno.json` imports on first run

## Commands

```bash
# Development — watch mode + DEV_MODE enabled
deno task dev

# Production — watch mode, no dev extras
deno task start

# Run all tests
deno task test

# Run a single test file
deno test test/game_test.js -A

# Tests in watch mode
deno task test:watch

# Coverage report
deno task coverage

# Detailed coverage (runs coverage first)
deno task detailed-coverage

# Lint + auto-fix
deno task lint
```

Default port: **8000**. Override with `PORT` env var.

## Git Hooks

Run once after cloning:

```bash
./setup.sh
```

This installs:
- **pre-commit** — runs `deno lint`
- **pre-push** — runs test suite

## Dev Mode

`deno task dev` sets `DEV_MODE=true`, which unlocks:

| Endpoint | Purpose |
|----------|---------|
| `GET /dev` | Redirects to `/dev.html` (game state control panel) |
| `POST /dev/login { name }` | Creates a player session without normal auth |
| `GET /load/:state` | Loads a JSON game state from `data/states/<state>.json` |
| `GET /save/:name` | Saves current game state to `data/states/<name>.json` |

Use `POST /dev/login` to script multiple players in one session for local testing.

## Testing a Game Locally

1. `deno task dev`
2. Open `http://localhost:8000/login.html`
3. In browser console or curl: `POST /dev/login { "name": "Alice" }` → sets `playerId` cookie
4. Open a second browser profile, repeat for "Bob", "Charlie", etc.
5. Navigate to `/` → each player goes through lobby → game

## Docker

```bash
docker build -t risk-imperium .
docker run -p 8000:8000 risk-imperium
```

The Dockerfile uses `deno:2.7.5` as the base image.

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `8000` | Server listen port |
| `DEV_MODE` | `false` | Enables dev endpoints and bypass login |
