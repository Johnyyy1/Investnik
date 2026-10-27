# Parallel issue development — Git worktrees

This is the shared isolation policy for **Codex and Claude Code** working on Investník.
It is loaded via the repository `AGENTS.md` (and `CLAUDE.md`, which imports AGENTS.md).
A `WORKTREES.md` file is **not** automatically discovered by coding agents on its own.

## Non-negotiable rule

**One implementation task / issue = one isolated checkout, one change branch, one PR.**
Never implement two independent issues in the same checkout at the same time.
Do not edit the shared primary checkout when another agent might be using it.
An agent must **verify** isolation before writing; instructions alone do not create a worktree.

## Starting a session (preferred native mechanisms)

- **Codex desktop app:** start a new chat in **Worktree** mode, select the intended up-to-date base branch (normally `main`), and assign one issue. Codex creates and manages the isolated worktree. It can start in detached HEAD; create a meaningful feature branch before pushing a PR if needed. Do not assume the app's local `main` is current without checking.
- **Claude Code CLI:** launch a separate process with `claude --worktree issue-<number>-<slug>` (or `claude -w issue-<number>-<slug>`). It creates and enters an isolated worktree. Use a distinct name per task/session.
- **Claude Desktop Code:** enable its worktree option for the session.
- **Other/CLI execution without native worktree mode:** from a clean, safely inspected base checkout, create a distinct worktree before starting edits, or have the agent create it **if its environment lets it change working directory**. For example:
  ```bash
  git fetch origin main
  git worktree add -b feat/issue-123-short-name ../investnik-issue-123-short-name origin/main
  cd ../investnik-issue-123-short-name
  # Start the coding agent from this directory.
  ```
  Adjust both names per task; if the branch/path already exists, inspect it first instead of deleting or overwriting anything. These commands are a fallback, not required when using native Worktree mode.

**Important limitation:** writing a rule in this file cannot retroactively move a running Codex/Claude session to another checkout or make an app select Worktree mode. If the current client is locked to a shared directory and cannot switch to a worktree, request a worktree-mode restart **before modifying files**. An already isolated remote/cloud checkout is also acceptable.

## Pre-edit isolation check

At the beginning of every coding task, inspect:

```bash
pwd
git status --short
git branch --show-current
git worktree list
git log -1 --oneline
```

- Confirm the current directory is this task's isolated checkout, not a different agent's directory.
- For a newly started task, base work on an up-to-date `origin/main` when practicable. Never switch the branch of, reset, or clean a shared checkout.
- Do not overwrite, stage, commit, or discard pre-existing unrelated changes. If the worktree contains unexpected changes, inspect and report them.
- Preserve unique issue/branch/PR ownership, including when several agents work simultaneously.

## During implementation

- Work only within the assigned issue's scope. Inspect relevant shared contracts and open PRs before touching the curriculum registry, lesson totals/reward expectations, database schema/migrations, authentication, or common UI.
- Worktrees isolate files; they **do not** prevent logical conflicts between simultaneously merged changes. If a shared contract is being modified elsewhere, coordinate ownership or serialize those PRs.
- Do not share a mutable local development database, ports, `.next` build directory, or untracked credentials/configuration between worktrees without deliberate per-worktree setup. Install dependencies in the isolated checkout as needed.
- Never expose or commit credentials. Codex desktop worktree setup scripts and its `.worktreeinclude` mechanism are optional for explicitly needed gitignored local files; treat secrets as sensitive.
- Do not make unrelated fixes to silence a failing check; explain and scope any unrelated baseline problem.

## Before publishing a pull request

1. Inspect `git status`, the full diff, and the commit range versus `origin/main`; verify only the assigned changes are included.
2. Run the repository's relevant preflight. For code changes, this normally includes:
   ```bash
   npx next typegen
   npm run lint
   npm run knip
   npm run typecheck
   npm test
   npm run build
   npm run check:lesson-bundle
   ```
   Run relevant browser and persistence/integration suites for affected behavior. If tests cannot run, report which checks were skipped and why; do not claim success or silently bypass checks.
3. Check for newer `main` changes before final integration. Rebase or merge into **your own** worktree branch only if safe; resolve resulting conflicts and rerun affected tests. Never force push over another agent's work.
4. Open **one focused PR** to `main`, referencing its issue, validation results, and any integration risks. A non-passing or unverified PR must remain **draft** and clearly disclose the blocker.
5. Merge only after required GitHub checks pass for the latest PR head. Where merge queue is enabled, ensure workflows also support its `merge_group` event and pass on the integration candidate.

## After merging

- Do not remove another agent's worktree. Clean up only **your own** completed worktree/branch once no unpushed or otherwise valuable changes remain, following the client's native cleanup workflow where available.
- Avoid deleting worktrees just because their PR was opened; review and corrections may still be needed.

**Expected handoff:** identify issue, worktree/branch, PR URL, tests run with outcomes, skipped checks, and known conflicts. Never label an untested change as CI-ready.
