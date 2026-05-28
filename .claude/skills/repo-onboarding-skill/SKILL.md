---
name: repo-onboarding-skill
description: Helps users quickly understand and navigate any new or large GitHub repository or local project by following a repeatable onboarding workflow. Reads and updates project-context/ files automatically.
metadata:
  author: "Tayyabain Haider"
  version: "2.0.0"
  category: "developer-productivity"
  tags: [codebase, onboarding, architecture, workflow]
---

# Repo Onboarding Guide

## Purpose

Repeatable onboarding workflow: help any new team member understand the
repository, its structure, its stack, its entrypoints, how to run it, and how to
test it — fast. This skill reads from and writes to `project-context/` so
knowledge accumulates across sessions. See `context-loader.md` for read/write
rules and `output-format.md` for response formatting.

## Workflow

### Phase 1 — Load Existing Context

Before discovering anything from the codebase, read all files in
`project-context/` (if the folder exists):

- `project-context/overview.md`
- `project-context/architecture.md`
- `project-context/auth-session.md`
- `project-context/game-logic.md`
- `project-context/dev-setup.md`

If the folder does not exist yet, skip to Phase 2 and create it during Phase 3.

### Phase 2 — Discover & Fill Gaps

Compare what was loaded against the output sections required by
`output-format.md`. For any section that is missing or stale, read the relevant
source files:

- Stack / entrypoints: `main.js`, `deno.json` / `package.json`, top-level config
  files
- Architecture: `src/app.js`, routing files, middleware
- Auth / session: auth handlers, middleware files
- Game / domain logic: core model or domain files
- Dev setup: task runners, Dockerfiles, CI config, README

Do **not** re-read files whose content is already fully covered by
`project-context/`.

### Phase 3 — Update `project-context/`

After discovering new or changed information, update the relevant
`project-context/` file. Follow the rules in `context-loader.md`:

- Update only the file(s) whose scope covers the new information
- Do not duplicate content across files
- If `project-context/` does not exist yet, create the folder and all five files

### Phase 4 — Produce Onboarding Summary

Render the full onboarding response using the format defined in
`output-format.md`.

## Use Cases

- "Help me understand this repo"
- "Where should I start in this codebase?"
- "Give me an overview of this project"
- "What does this repository do?"
- Any new team member asking for a project walkthrough
