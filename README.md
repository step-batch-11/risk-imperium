# Risk Imperium

A browser-based multiplayer take on the classic *Risk* board game. Build a
lobby, split up the world map, and battle other players through reinforcement,
invasion, and fortification phases until one empire stands.

**Play it here → https://risk-imperium.onrender.com/**

## How to play

1. Open the link above and log in with a display name.
2. Host a lobby or join one with a lobby code, then wait for players to gather.
3. Each turn moves through phases: **reinforce** (place new troops),
   **invade** (attack neighboring territories), **defend** (respond to
   incoming attacks), and **fortify** (move troops between your territories).
4. Capture territories to earn cards and reinforcements; eliminate opponents
   or control the map to win.
5. You can leave a game mid-session — remaining players continue without you.

No installs needed — it runs entirely in the browser, one tab per player.

## Tech stack

- [Deno](https://deno.com/) + [Hono](https://hono.dev/) for the backend
- Vanilla JS/HTML/CSS frontend, no build step
- In-memory game state (no database) — state resets on server restart

## Local development

```
deno task dev
```
Then open http://localhost:8000.
