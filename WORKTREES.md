# Parallel issue development — Git worktrees

This is the shared isolation policy for **Codex and Claude Code** working on Investník.
The repository `AGENTS.md` explicitly requires agents to open and read this file in full before implementation or PR preparation; `CLAUDE.md` imports that root file with `@AGENTS.md`.
A `WORKTREES.md` file is **not** automatically discovered by coding agents on its own.

## Non-negotiable rule

**One implementation task / issue = one isolated checkout, one change branch, one PR.**
Never implement two independent issues in the same checkout at the same time.
Do not edit the shared primary checkout when another agent might be using it.
An agent must **verify** isolation before writing; instructions alone do not create a worktree.

## Starting a session (preferred native mechanisms)

- **Codex desktop app:** start a new chat in **Worktree** mode, select the intended up-to-date base branch (normally `main`), and assign one issue. Codex creates and manages the isolated worktree. It can start in detached HEAD; create a meaningful feature branch before pushing a PR if needed. Do not assume the app's local `main` is current without checking.
- **Codex Cloud:** use the task's own isolated remote checkout. Verify the repository, base revision and task ownership there; a second local worktree is unnecessary. Cloud isolation is supplied by the runtime, not by these instructions, and does not imply access to local files or processes.
- **Claude Code CLI:** launch a separate process with `claude --worktree issue-<number>-<slug>` (or `claude -w issue-<number>-<slug>`). It creates and enters an isolated worktree, normally under `<repo>/.claude/worktrees/`. Use a distinct name per task/session. In an existing session, prefer the native `EnterWorktree` tool when available, then verify its resulting directory.
- **Claude Desktop:** in the **Code** tab, enable Worktree before starting the session and verify the resulting checkout. Worktree can be disabled; a separate conversation alone does not prove isolation. Chat/Cowork is not the Code worktree workflow. Use the client’s configured worktree location rather than assuming it matches another client.
- **Other/CLI execution without native worktree mode:** from a clean, safely inspected base checkout, create a distinct worktree before starting edits, or have the agent create it **if its environment lets it change working directory**. For example:
  ```bash
  git fetch origin main
  git worktree add -b feat/issue-123-short-name ../investnik-issue-123-short-name origin/main
  cd ../investnik-issue-123-short-name
  # Start the coding agent from this directory.
  ```
  Adjust both names per task; if the branch/path already exists, inspect it first instead of deleting or overwriting anything. These commands are a fallback, not required when using native Worktree mode.

**Important limitation:** Markdown cannot create a worktree or select a client mode. Moving a running session requires an actual supported native operation (such as Codex Handoff or Claude `EnterWorktree`) or an environment that can execute tools in the dedicated path. If creation is unavailable but this task already has an isolated checkout, verify it and continue. If the client is locked to a shared directory and cannot create or enter an isolated checkout, preserve the original working directory and all uncommitted changes, report the limitation, and request a worktree-mode restart **before modifying files**. Do not reset, clean, stash, or switch the shared checkout to work around the limitation.

## Ignoring generated Claude checkouts

The root `.gitignore` contains exactly this directory-scoped rule:

```gitignore
# Claude Code native worktrees
/.claude/worktrees/
```

It excludes generated checkouts from the parent checkout’s status and accidental staging. It does not ignore all of `.claude/`: settings, rules, skills and other project configuration remain eligible for tracking. The leading slash limits this rule to the repository root. It does not alter Git’s registered worktree metadata, `git worktree list`, creation or removal, or the client’s native lifecycle. Do not force-add generated checkouts. Custom worktree locations need their own location-appropriate ignore rule if they are inside the repository.

Client behavior was checked against [Codex environments](https://learn.chatgpt.com/docs/environments/modes), [Codex worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees), [Claude Code worktrees](https://code.claude.com/docs/en/worktrees), [Claude Desktop Code](https://code.claude.com/docs/en/desktop#run-a-session-in-its-own-worktree), and [Git ignore semantics](https://git-scm.com/docs/gitignore) on 2026-10-27. Verify the installed client’s capabilities; these references do not configure it.

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
   For documentation-only changes, run diff/whitespace, instruction-size, link/path and consistency checks, including unchanged requirement coverage and instruction discovery when moving guidance. For ignore changes, check both excluded and unaffected paths and worktree creation/listing/cleanup in a disposable repository. Application gates above and relevant browser/persistence/integration suites apply when their behavior changes. If required tests cannot run, report which checks were skipped and why; do not claim success or silently bypass checks.
3. Check for newer `main` changes before final integration. Rebase or merge into **your own** worktree branch only if safe; resolve resulting conflicts and rerun affected tests. Never force push over another agent's work.
4. Open **one focused PR** to `main`, referencing its issue, validation results, and any integration risks. A non-passing or unverified PR must remain **draft** and clearly disclose the blocker.
5. Merge only after required GitHub checks pass for the latest PR head. Where merge queue is enabled, ensure workflows also support its `merge_group` event and pass on the integration candidate.

## After merging

- Do not remove another agent's worktree. Clean up only **your own** completed worktree/branch once no unpushed or otherwise valuable changes remain, following the client's native cleanup workflow where available.
- Avoid deleting worktrees just because their PR was opened; review and corrections may still be needed.

**Expected handoff:** identify issue, worktree/branch, PR URL, tests run with outcomes, skipped checks, and known conflicts. Never label an untested change as CI-ready.
