# Project Overview

## What It Is

Risk Imperium is a real-time multiplayer **Risk board game** served as a web
application. Players log in, join or create a lobby room, and play through the
classic Risk phases via a browser UI. There is no persistent database — all
state lives in-memory for the lifetime of the server process.

## Tech Stack

| Layer          | Technology                                             |
| -------------- | ------------------------------------------------------ |
| Runtime        | Deno (v2.7.5)                                          |
| Web framework  | Hono (Express-like, runs on Deno)                      |
| Frontend       | Vanilla JavaScript + HTML + CSS (no build step)        |
| Test framework | Deno built-in + `@std/testing/bdd` (describe/it style) |
| Container      | Docker (Deno 2.7.5 base image)                         |

## Key Characteristics

- **No database** — game state, lobbies, and player sessions are stored in
  JavaScript `Map`/object instances wired up in `main.js`
- **Cookie-based identity** — `playerId`, `gameId`, and `lobbyId` cookies drive
  all routing and authorization
- **Dev mode** — setting `DEV_MODE=true` unlocks `/dev` page, JSON save/load of
  game states, and a bypass login endpoint
- **Single process** — no workers, queues, or external services; the whole game
  runs in one Deno process
