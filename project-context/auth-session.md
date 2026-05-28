# Auth & Session

## Identity Model

There is no JWT or server-side session store. Identity is tracked entirely through **three cookies** set by the server:

| Cookie | Type | Meaning |
|--------|------|---------|
| `playerId` | number | Set on login; key into the `players` object |
| `lobbyId` | number | Set when player joins/creates a lobby room |
| `gameId` | number | Set when a game starts from a lobby |

The `players` object (plain JS `{}`) maps `playerId → playerName`. It lives in `main.js` and is injected into every request context.

## Login Flow

```
POST /login
  → redirectLoggedInPlayer  (skip if already logged in)
  → loginHandler            (src/handlers/auth.js)
      reads body { name }
      assigns next counter value as playerId
      stores players[playerId] = name
      sets playerId cookie
      responds 200
```

Logout clears the cookie and removes the player from the `players` object.

## Dev Mode Login

When `DEV_MODE=true`, a second login endpoint is available:

```
POST /dev/login  { name }
  → assigns playerId without any validation
  → useful for scripting multiple test players in one browser session
```

## Middleware Guard Chain

Every protected route runs one or more of these guards (defined in `src/middle_ware.js`):

```
rejectUnknownUser
  checks: players[playerId] exists
  on fail: redirect → /login.html

redirectLoggedInPlayer
  checks: players[playerId] exists
  on pass (already logged in): redirect → /
  use: applied to /login.html so logged-in users can't revisit it

rejectIfNotInGame
  checks: gamesRepo.has(gameId)
  on fail: redirect → /
  use: guards /setup, /user-actions, /game.html

redirectInGamePlayer
  checks: gamesRepo.has(gameId)
  on pass (in a game): redirect → /game.html
  use: prevents in-game players from going to lobby or home

redirectInLobbyPlayer
  checks: lobbies.has(lobbyId)
  on pass (in a lobby): redirect → /lobby.html
  use: prevents lobbied players from going to home

setGame  (not a guard — enriches context)
  reads gameId cookie → looks up Game in gamesRepo
  sets context.game and context.playerId
  always calls next()
```

## Route Protection Matrix

| Route | Guards applied |
|-------|---------------|
| `GET /` | rejectUnknownUser → redirectInLobbyPlayer → redirectInGamePlayer |
| `GET /login.html` | redirectLoggedInPlayer |
| `GET /game.html` | rejectUnknownUser → rejectIfNotInGame |
| `GET /lobby.html` | rejectUnknownUser → redirectInGamePlayer |
| `POST /user-actions` | rejectUnknownUser → rejectIfNotInGame → setGame |
| `GET /setup` | rejectUnknownUser → rejectIfNotInGame → setGame |
| `POST /logout` | rejectUnknownUser |
| `POST /leave-lobby` | rejectUnknownUser → redirectInGamePlayer |
