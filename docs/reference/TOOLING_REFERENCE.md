# RideOps — Claude Code Tooling Reference

This document catalogs every agent and plugin available to Claude Code when working on the RideOps repository. Reference this when writing prompts to ensure the right tools are assigned to the right tasks.

---

## Agents (Subagents via Task Tool)

Agents are spawned by Claude Code to run focused subtasks in parallel. Each agent has access to the full codebase, all plugins, and project memory (CLAUDE.md).

| Agent | Model | Memory | Purpose |
|-------|-------|--------|---------|
| `architect` | Opus | ✔ Project | System design, file structure, dependency decisions, deployment architecture, refactoring strategies |
| `audit` | Opus | ✔ Project | Code review, security analysis, endpoint verification, data model validation, convention enforcement |
| `build` | Opus | ✔ Project | Feature implementation, bug fixes, API development, database migrations, backend/frontend code changes |
| `premortem` | Opus | ✔ Project | Risk analysis, failure scenario mapping, edge case identification, demo rehearsal, competitive gap analysis |
| `requirements-analyst` | Opus | ✔ Project | Business logic validation, data model completeness, settings/config auditing, spec verification |
| `ui-polish` | Opus | ✔ Project | CSS fixes, responsive design, visual consistency, icon systems, loading/empty states, animation, accessibility |
| `ui-research` | Opus | ✔ Project | Design system research, competitor UI analysis, component pattern exploration, UX best practices |

### Agent Usage Pattern

```
# Single agent (focused task)
Spawn a `build` agent to implement database indexes...

# Multi-agent (coordinated work)
Spawn agents in parallel:
- `architect` → designs the session security overhaul
- `build` → implements the architect's plan
- `audit` → verifies the implementation after build completes
```

---

## Plugins (Enabled)

### Code Intelligence

| Plugin | Status | What It Does |
|--------|--------|--------------|
| `typescript-lsp` | ✔ Enabled | Language server for type checking, go-to-definition, hover info, diagnostics. Works on JS/TS files. Use for catching type errors and understanding code relationships. |
| `code-review` | ✔ Enabled | Structured code review with severity ratings, best practice checks, and actionable suggestions. |
| `code-simplifier` | ✔ Enabled | Identifies unnecessarily complex code and suggests simplifications. Good for refactoring monoliths. |
| `feature-dev` | ✔ Enabled | End-to-end feature development workflow: planning, implementation, testing, documentation. |

### Testing & Browser Automation

| Plugin | Status | What It Does |
|--------|--------|--------------|
| `playwright` | ✔ Enabled | Browser automation for E2E testing. Can navigate pages, click elements, fill forms, take screenshots, assert content. Connected via MCP. |

### Design & Frontend

| Plugin | Status | What It Does |
|--------|--------|--------------|
| `frontend-design` | ✔ Enabled | UI/UX design guidance, component architecture, responsive patterns, design system enforcement. |

### Security

| Plugin | Status | What It Does |
|--------|--------|--------------|
| `security-guidance` | ✔ Enabled | Security best practices, vulnerability identification, secure coding patterns. Use for auth, session, input validation, and XSS/SQLi prevention work. |

### Deployment

| Plugin | Status | What It Does |
|--------|--------|--------------|
| `vercel` | ✔ Enabled | Vercel deployment integration. Manage deployments, environment variables, and project settings. |

### Reasoning & Context

| Plugin | Status | What It Does |
|--------|--------|--------------|
| `sequential-thinking` | ✔ Connected (MCP) | Step-by-step reasoning for complex multi-part problems. Use when planning multi-file changes or debugging intricate issues. |
| `context7` | ✔ Connected (MCP) | Retrieves up-to-date documentation for libraries and frameworks (Express, pg, bcrypt, Tabler, FullCalendar, etc.) directly from source. Use instead of guessing API signatures. |

### Project Management & Workflow

| Plugin | Status | What It Does |
|--------|--------|--------------|
| `claude-code-setup` | ✔ Enabled | Project initialization, configuration, and environment setup. |
| `claude-md-management` | ✔ Enabled | CLAUDE.md lifecycle management — reading, updating, and maintaining project memory across sessions. |
| `ralph-loop` | ✔ Enabled | Iterative refinement loop for complex tasks — plan → execute → evaluate → refine. |
| `superpowers` | ✔ Enabled | Extended capabilities for advanced operations. |

### Version Control

| Plugin | Status | What It Does |
|--------|--------|--------------|
| `github` | ✘ Failed | GitHub integration (issues, PRs, repo management). Currently broken — use CLI `git` and `gh` commands as fallback. |

---

## MCP Servers (Connected)

| Server | Status | Protocol |
|--------|--------|----------|
| `context7` | ✔ Connected | Library documentation lookup |
| `playwright` | ✔ Connected | Browser automation for testing |
| `sequential-thinking` | ✔ Connected | Complex reasoning chains |
| `github` | ✘ Failed | Not available — use `git` CLI |

---

## Recommended Tool-to-Task Mapping

| Task Type | Primary Tool | Supporting Tools |
|-----------|-------------|-----------------|
| Security hardening | `security-guidance` plugin + `audit` agent | `sequential-thinking` for planning |
| Database changes | `build` agent | `context7` for pg docs, `audit` agent for verification |
| UI/CSS fixes | `ui-polish` agent + `frontend-design` plugin | `playwright` for visual verification |
| Refactoring | `code-simplifier` plugin + `architect` agent | `typescript-lsp` for safe renames |
| New features | `feature-dev` plugin + `build` agent | `requirements-analyst` for spec, `audit` for review |
| E2E testing | `playwright` plugin | `premortem` agent for test scenario design |
| Deployment | `vercel` plugin + `architect` agent | `security-guidance` for production config |
| Documentation | `claude-md-management` plugin | `requirements-analyst` for accuracy |

---

## Notes

- **GitHub plugin is broken.** All git operations should use CLI (`git add`, `git commit`, `git push`, `gh pr create`, etc.).
- **context7 is invaluable.** Before implementing anything with Express, pg, bcrypt, nodemailer, or any dependency, use context7 to pull current docs rather than relying on training data.
- **Playwright is available for verification.** After any UI change, spawn a playwright session to screenshot the result and confirm it visually.
- **Always update CLAUDE.md** after significant changes using the `claude-md-management` plugin or manual edits. This is the project's long-term memory.
