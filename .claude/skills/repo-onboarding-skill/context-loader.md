# Context Loader

Rules for reading and writing `project-context/` files. Referenced by `SKILL.md`.

## File Scope Map

Each `project-context/` file owns a specific scope. Put new information in the correct file — never duplicate across files.

| File | Owns |
|------|------|
| `overview.md` | What the project is, tech stack table, key characteristics |
| `architecture.md` | Layer breakdown, request lifecycle, handler/service/model responsibilities, frontend structure |
| `auth-session.md` | Cookie model, login flow, middleware guards, route protection matrix |
| `game-logic.md` | State machine, Game class fields, combat flow, in-memory models, troop calculation, test fixtures |
| `dev-setup.md` | Commands, git hooks, dev mode endpoints, local test walkthrough, Docker, env vars |

## When to Read

Always read all five files at the start of any onboarding session (Phase 1 in `SKILL.md`). Reading is cheap; skipping it means re-discovering things that are already known.

## When to Write

Update a file when:
- A new team member reveals information not yet captured (e.g. a new service, a changed auth flow)
- You discover a discrepancy between `project-context/` and the actual codebase
- The user confirms a correction or addition

Do **not** write when:
- The information is already accurately captured
- The change is speculative or unconfirmed
- The information belongs in `CLAUDE.md` instead (project-wide conventions, build commands already there)

## How to Update

1. Identify which file owns the scope of the new information (use the table above)
2. Edit only that file — targeted edits, not rewrites
3. Keep the existing structure; add a new row to a table or a new section rather than reformatting everything
4. If a whole new scope emerges that doesn't fit any existing file, create a new file and add a row to the scope map in this file

## Creating `project-context/` From Scratch

If the folder doesn't exist, create all five files in one pass after completing Phase 2 discovery in `SKILL.md`. Use the headings and table structure of the existing files as a template. Populate each file only with confirmed facts from reading actual source files — do not speculate.
