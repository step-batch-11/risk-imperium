---
name: codebase-kt-generator
description: Generates a structured onboarding and KT (Knowledge Transfer) guide by analyzing an entire codebase, including architecture, modules, data flow, and deployment details for new developers.
tools: read, bash, search
---

# Codebase KT Generator skill

## purpose

The Codebase KT Generator skill is designed to help new developers quickly
understand and navigate a complex codebase. By analyzing the entire codebase, it
generates a structured onboarding and knowledge transfer guide that covers the
architecture, modules, data flow, and deployment details.

## Use this skill when:

- The user asks for a full understanding of a codebase or repository
- The user requests architecture, system design, or module breakdown
- The user is onboarding to a new project and needs KT documentation
- The user asks "how does this system work?"
- The user requests a high-level explanation of the project

## Don't use this skill for :

- The user is asking to debug a specific error or function
- The user requests a code fix or implementation
- The user is working with a single file or small code snippet
- The user asks for feature development or coding help

## Analysis Scope (Include Paths)

- src/
- Readme.md
- services/
- controllers/
- *.yaml
- *.yml
- modules/
- config/
- package.json
- Dockerfile
- docs
- features/
- scripts/
- handlers/

## Exclusion Rules (Ignore Paths)

- node_modules/
- dist/
- build/
- .git/
- .vscode/
- .idea/
- .env
- *.log
- coverage/
- .gitignore
- .dockerignore
- .github/
- styles/
- assets/
- style/

## Output Rules

- Focus on architecture over file-level explanation
- Prefer system-level understanding
- Avoid describing trivial utility files
- Do not hallucinate missing information
- Clearly mention if something is not found in codebase
- Keep onboarding explanation beginner-friendly
- Structure output in a logical learning order

## Output Format

The final KT should always include:

1. Project Overview
2. Tech Stack
3. Architecture Overview
4. Folder Structure Explanation
5. Core Modules Breakdown
6. API / Data Flow
7. Authentication Flow
8. Important Configurations
9. Deployment Process
10. Common Commands
11. Debugging Guide
12. First Things to Learn
