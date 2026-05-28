# Output Format

Defines the required structure of every onboarding response. Referenced by
`SKILL.md`.

## Required Opening Marker

Every response must begin with this exact line:

```
[repo-onboarding-guide skill active]
```

## Required Sections

Render all six sections in this order. Do not skip a section — if information is
unavailable, write a one-line note explaining why.

### 1. Project Summary

2–3 sentences. What the project does, who uses it, and one key architectural
characteristic (e.g. "no database, all in-memory").

### 2. Stack

A markdown table with columns: Layer | Technology. Cover runtime, framework,
frontend, test tooling, container if present.

### 3. Structure Map

A fenced code block showing the top-level directory tree. Annotate each entry
with a `←` comment describing its role. Keep it to ~15 lines — omit deeply
nested paths that can be discovered by reading.

### 4. Key Entrypoints & Core Files

A markdown table with columns: File | Role. List 5–8 files. Focus on files that
are non-obvious or that act as junctions between layers.

### 5. Run & Test Commands

A fenced bash block with all essential commands: dev, start, test, single-file
test, lint, coverage. Follow with a short note on any env vars or one-time setup
steps.

### 6. Suggested Next Steps

A numbered list of 3–5 concrete actions. Prefer hands-on steps (run the app,
trace a request, read a specific file) over generic advice. Each step should be
one sentence.

## Format Rules

- Use tables for structured comparisons (stack, files, routes)
- Use fenced code blocks for commands, directory trees, and code traces
- Keep the total response scannable in under 2 minutes — trim prose, prefer
  lists
- Do not repeat information that is already covered in another section
