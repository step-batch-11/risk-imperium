# Game Logic

## State Machine

The `Game` class (`src/game.js`) owns all game state behind private fields. It cycles through these phases:

```
SETUP
  └─▶ REINFORCE  (each player places troops on owned territories)
        └─▶ INVADE    (active player attacks neighbours)
              └─▶ FORTIFY   (active player moves troops once)
                    └─▶ REINFORCE (next player's turn)
```

The `STATES` enum is defined in `src/config.js` and used throughout handlers and services.

### Phase Transitions

Each transition is a method on `Game` called by its matching service after validating the action:

| Phase | Trigger | Service |
|-------|---------|---------|
| SETUP → REINFORCE | All territories claimed | `setup_service.js` |
| REINFORCE → INVADE | Troops depleted | `reinforcement.js` / `setup_reinforce.js` |
| INVADE → FORTIFY | Player skips or ends attacks | `skip_invasion.js` |
| FORTIFY → REINFORCE (next) | Player fortifies or skips | `fortification.js` / `skip_fortification.js` |

## The `Game` Class

All fields are private (`#`). Key ones:

| Field | Type | Purpose |
|-------|------|---------|
| `#activePlayerIndex` | number | Index into `#players` array; rotates on turn end |
| `#state` | STATES | Current game phase |
| `#territories` | Territories handler | Territory ownership and troop counts |
| `#players` | Player[] | Ordered player list |
| `#cards` | Cards handler | Deck and player hands |
| `#continents` | Continents handler | Continent bonus calculation |
| `#cavalry` | Cavalry handler | Troop positioning on map |
| `#hasCaptured` | boolean | Whether active player captured a territory this turn (triggers card draw) |
| `#versionId` | number | Increments on every state change; used by polling to detect updates |

## Combat Flow

Attack is a two-step async exchange between attacker and defender:

```
POST /user-actions  { action: "invade", from, to, troops }
  → invade.js       validates adjacency and ownership, records pending attack
  → game enters "waiting for defender" sub-state

POST /user-actions  { action: "defend", troops }
  → defend.js       defender commits troop count
  → resolve_combat.js  rolls dice, calculates losses
  → capture.js      if attacker wins, transfers territory ownership
```

`invasion_controller.js` in handlers orchestrates this exchange.

## In-Memory Models

### `Territory` (`src/models/territory.js`)
Holds owner ID, troop count, and neighbour list. Adjacency data comes from `src/config.js`.

### `Player` (`src/models/player.js`)
Holds player ID, name, color, and territory list. Eliminated when troop count reaches zero.

### `Continents` (`src/models/continents.js`)
Calculates bonus troops awarded when a player owns all territories in a continent.

### `Cards` (`src/models/cards.js`)
Standard Risk card deck (Infantry / Cavalry / Artillery). `card_service.js` handles draw and trade-in logic.

### `Cavalry` (`src/models/cavalry.js`)
Tracks cavalry piece positions on the map for the frontend animation layer.

## Troop Calculation

```js
get remainingTroop() {
  const deployedTroopsPerPlayer = this.#round / this.#playersCount;
  return this.#troops - Math.floor(deployedTroopsPerPlayer);
}
```

`#round` increments each time any player places a troop during SETUP. `#troops` is the initial troop budget (`initTroops` constructor param, default 2 in tests).

## Test Fixtures

`data/tests/` contains JSON snapshots of mid-game states. Services load these via `readTextFile` to test specific scenarios (e.g., a game already in INVADE phase with specific territory ownership) without needing to replay the full game flow.
