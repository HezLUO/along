# Navi Repository Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split Navi into `HezLUO/navi` as the independent alpha product repository while converting `HezLUO/along` into a lightweight umbrella / vision repository.

**Architecture:** Use two repositories after the split. Start from the current `Along` history, push that history and existing tags to a new public `navi` repository, then let `navi` and `along` diverge with separate follow-up commits: Navi gets product-repository metadata and release surface; Along gets a small vision README and product pointers.

**Tech Stack:** Git, GitHub CLI (`gh`), Markdown, npm, TypeScript, Vitest, existing Navi plugin verification scripts.

---

### Task 1: Preflight Current Along State

**Files:**
- Verify only: `/Users/james/Codex Project/General Codex Project/Along`

- [ ] **Step 1: Confirm local branch state**

Run:

```bash
git status -sb
```

Expected: branch is `main`, tracking `origin/main`, with only committed planning changes ahead of remote and no staged or unstaged file changes. If any unrelated local changes appear, stop and inspect them before continuing.

- [ ] **Step 2: Confirm the planning commits**

Run:

```bash
git log --oneline -5
```

Expected: the recent history includes:

```text
docs: design navi repository split
docs: prepare navi alpha patch release
docs: clarify navi along product hierarchy
```

After this implementation plan is committed, the recent history should also include:

```text
docs: plan navi repository split
```

- [ ] **Step 3: Scan tracked filenames for obvious private files**

Run:

```bash
git ls-files | rg '(^|/)(\.env|\.env\.|id_rsa|id_ed25519|.*\.pem|.*\.key|credentials|secrets?)($|/|\.)'
```

Expected: no output and exit code `1`. If it prints a tracked file, inspect the file before publishing to `HezLUO/navi`.

- [ ] **Step 4: Scan tracked content for obvious token and private-key patterns**

Run:

```bash
rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' --glob '!dist/**' '(sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY-----)'
```

Expected: no output and exit code `1`. If it prints a match, inspect the file and remove or rotate the secret before publishing.

- [ ] **Step 5: Run current Navi package verification**

Run:

```bash
npm run verify:plugin-package
```

Expected: exit code `0`.

- [ ] **Step 6: Run current typecheck**

Run:

```bash
npm run typecheck
```

Expected: exit code `0`.

- [ ] **Step 7: Run current test suite**

Run:

```bash
npm test
```

Expected: exit code `0`. If the sandbox blocks local server listen permissions with an `EPERM` error, rerun the same command with approved escalation and record that the rerun was needed only for local listen permissions.

- [ ] **Step 8: Push the approved planning state to Along**

Run:

```bash
git push origin main
```

Expected: `origin/main` advances to include the repository-split design and this implementation plan.

- [ ] **Step 9: Confirm Along is clean after push**

Run:

```bash
git status -sb
```

Expected:

```text
## main...origin/main
```

### Task 2: Create `HezLUO/navi` And Push History

**Files:**
- Modify GitHub remote state: `HezLUO/navi`
- Verify only: `/Users/james/Codex Project/General Codex Project/Along`

- [ ] **Step 1: Check whether `HezLUO/navi` already exists**

Run:

```bash
gh repo view HezLUO/navi --json nameWithOwner,visibility,isPrivate,defaultBranchRef
```

Expected for first execution: GitHub CLI reports the repository is not found. If the repository exists, run:

```bash
git ls-remote https://github.com/HezLUO/navi.git
```

Expected for a reusable empty repository: no refs. If refs exist, stop and ask for confirmation before overwriting or reusing it.

- [ ] **Step 2: Create the public Navi repository if it does not exist**

Run:

```bash
gh repo create HezLUO/navi --public --description "Navi helps non-expert users understand, supervise, and steer expert agents."
```

Expected: GitHub creates `https://github.com/HezLUO/navi` as public.

- [ ] **Step 3: Add a `navi` remote to the current Along worktree**

Run:

```bash
git remote add navi https://github.com/HezLUO/navi.git
```

Expected: no output and exit code `0`. If the remote already exists, run:

```bash
git remote set-url navi https://github.com/HezLUO/navi.git
```

- [ ] **Step 4: Push current main history to Navi**

Run:

```bash
git push navi main:main
```

Expected: remote branch `main` is created or updated on `HezLUO/navi`.

- [ ] **Step 5: Push existing tags to Navi**

Run:

```bash
git push navi --tags
```

Expected: existing alpha tags, including `v0.1.0-alpha.1`, are available on `HezLUO/navi`.

- [ ] **Step 6: Ensure Navi default branch is `main`**

Run:

```bash
gh repo edit HezLUO/navi --default-branch main
```

Expected: no output and exit code `0`.

- [ ] **Step 7: Verify public repo metadata**

Run:

```bash
gh repo view HezLUO/navi --json nameWithOwner,visibility,isPrivate,defaultBranchRef,description
```

Expected fields:

```json
{
  "nameWithOwner": "HezLUO/navi",
  "visibility": "PUBLIC",
  "isPrivate": false,
  "description": "Navi helps non-expert users understand, supervise, and steer expert agents."
}
```

- [ ] **Step 8: Verify the alpha tag was preserved**

Run:

```bash
git ls-remote --tags https://github.com/HezLUO/navi.git v0.1.0-alpha.1 'v0.1.0-alpha.1^{}'
```

Expected: output includes peeled commit:

```text
7592e1c7d68bef9e61245b9b7e2dcb8e59955100	refs/tags/v0.1.0-alpha.1^{}
```

### Task 3: Make Navi Metadata Canonical In The New Repository

**Files:**
- Clone / modify: `/Users/james/Codex Project/General Codex Project/Navi/README.md`
- Modify: `/Users/james/Codex Project/General Codex Project/Navi/package.json`
- Modify via npm: `/Users/james/Codex Project/General Codex Project/Navi/package-lock.json`
- Create: `/Users/james/Codex Project/General Codex Project/Navi/docs/releases/v0.1.0-alpha.1.md`
- Modify: `/Users/james/Codex Project/General Codex Project/Navi/docs/along/roadmaps/navi-post-alpha-roadmap.md`

- [ ] **Step 1: Create a clean local Navi clone**

Run from `/Users/james/Codex Project/General Codex Project`:

```bash
test ! -e Navi && git clone https://github.com/HezLUO/navi.git Navi
```

Expected: `Navi` did not already exist, and the clone succeeds. If `Navi` already exists, inspect it before continuing instead of overwriting it.

- [ ] **Step 2: Confirm the Navi clone remote**

Run from `/Users/james/Codex Project/General Codex Project/Navi`:

```bash
git remote -v
```

Expected:

```text
origin	https://github.com/HezLUO/navi.git (fetch)
origin	https://github.com/HezLUO/navi.git (push)
```

- [ ] **Step 3: Update the README first-screen relationship statement**

Modify the opening of `README.md` so the first paragraphs read:

```markdown
# Navi

Navi helps non-expert users understand, supervise, and steer expert agents.

Navi is an independent open-source product and the first V1 product surface from the broader Along vision. Along is the long-term companion-layer vision; Navi is the current alpha product you can inspect, install, and test today.

This repository is the canonical open-source alpha home for Navi. Navi's V1 alpha behavior centers on **Progress/Rhythm Maps** and **Challenge Layer** behavior inside active Codex sessions: it explains where a target project stands, what is missing, what comes next, what the user needs to confirm, and when expert-agent momentum needs a lightweight challenge.
```

Keep the existing alpha status, quick start, setup, architecture boundary, release notes, and license sections unless a sentence still implies `HezLUO/along` is the canonical Navi repository.

- [ ] **Step 4: Add a Relationship To Along section**

Insert this section after `## Alpha Status`:

```markdown
## Relationship To Along

Along is the broader long-term product vision: a local-first, open-source companion layer for existing agents.

Navi is the first independent V1 product surface from that vision. It is not the whole Along roadmap. The current Navi alpha focuses on non-expert supervision through Progress/Rhythm Maps, Challenge Layer behavior, and Working Thread continuity.

The internal package id remains `along-working-thread` for alpha compatibility. Treat that as an implementation and migration name, not the customer-facing product name.
```

- [ ] **Step 5: Update root package metadata to point to Navi**

Modify the top-level fields in `package.json` to match:

```json
{
  "name": "navi",
  "version": "0.1.0",
  "description": "Navi helps non-expert users understand, supervise, and steer expert agents with Progress Maps and Challenge Layer behavior.",
  "private": true,
  "license": "MIT",
  "type": "module",
  "repository": {
    "type": "git",
    "url": "https://github.com/HezLUO/navi.git"
  },
  "bugs": {
    "url": "https://github.com/HezLUO/navi/issues"
  },
  "homepage": "https://github.com/HezLUO/navi#readme"
}
```

Keep the existing `bin`, `scripts`, `dependencies`, and `devDependencies` unless tests show a direct break.

- [ ] **Step 6: Regenerate the package lock root metadata**

Run:

```bash
npm install --package-lock-only
```

Expected: exit code `0`; `package-lock.json` root package name changes from `along` to `navi`.

- [ ] **Step 7: Add tracked release notes for the recreated Navi GitHub release**

Create `docs/releases/v0.1.0-alpha.1.md` with:

```markdown
# Navi 0.1.0-alpha.1

Navi `0.1.0-alpha.1` clarifies the product hierarchy after the first alpha source release.

Navi is now treated as the independent open-source alpha product. Along remains the broader long-term companion-layer vision.

## Highlights

- Clarifies that Navi is the current independent V1 product surface from the Along vision, not the full Along roadmap.
- Keeps the V1 alpha behavior centered on Progress/Rhythm Maps, Rhythm Maps for flowing projects, and Challenge Layer behavior.
- Preserves the `along-working-thread` package and skill ids as alpha compatibility names.
- Keeps npm publication, public marketplace publication, automatic installers, runtime UI, background watcher behavior, and cross-agent adapters outside the current alpha scope.

## Verify From Source

```bash
npm install
npm run verify:plugin-package
npm run typecheck
npm test
```

This is a GitHub source pre-release for developers and early testers.
```

- [ ] **Step 8: Record the repository split in the Navi roadmap**

In `docs/along/roadmaps/navi-post-alpha-roadmap.md`, under distribution improvements, add:

```markdown
- Repository split follow-through: `HezLUO/navi` is the canonical Navi alpha product repository; `HezLUO/along` remains the lightweight umbrella and long-term product vision repository.
```

- [ ] **Step 9: Verify Navi repo docs and metadata**

Run:

```bash
rg -n "HezLUO/along|current V1 product surface of Along|This repository is the open-source alpha home" README.md package.json docs/releases/v0.1.0-alpha.1.md
```

Expected: no output. If output appears in `README.md` or `package.json`, update the text so `HezLUO/navi` is canonical and Along appears only as the broader vision.

- [ ] **Step 10: Run Navi verification**

Run:

```bash
npm run verify:plugin-package
npm run typecheck
npm test
git diff --check
```

Expected: all commands exit `0`. If `npm test` hits the local listen-permission sandbox issue, rerun the same command with approved escalation and record that the rerun was needed only for local listen permissions.

- [ ] **Step 11: Commit Navi metadata changes**

Run:

```bash
git add README.md package.json package-lock.json docs/releases/v0.1.0-alpha.1.md docs/along/roadmaps/navi-post-alpha-roadmap.md
git commit -m "docs: make navi repository canonical"
```

Expected: commit succeeds in `/Users/james/Codex Project/General Codex Project/Navi`.

- [ ] **Step 12: Push Navi main**

Run:

```bash
git push origin main
```

Expected: `HezLUO/navi` main advances to the Navi metadata commit.

### Task 4: Recreate Navi GitHub Pre-Release

**Files:**
- Read: `/Users/james/Codex Project/General Codex Project/Navi/docs/releases/v0.1.0-alpha.1.md`
- Modify GitHub remote state: `HezLUO/navi` release `v0.1.0-alpha.1`

- [ ] **Step 1: Check whether the release already exists on Navi**

Run:

```bash
gh release view v0.1.0-alpha.1 --repo HezLUO/navi --json name,isDraft,isPrerelease,tagName,targetCommitish
```

Expected for first execution: release is not found. If it exists, verify it is not a draft, is a pre-release, uses tag `v0.1.0-alpha.1`, and has title `Navi 0.1.0-alpha.1`.

- [ ] **Step 2: Create the pre-release if missing**

Run from `/Users/james/Codex Project/General Codex Project/Navi`:

```bash
gh release create v0.1.0-alpha.1 --repo HezLUO/navi --title "Navi 0.1.0-alpha.1" --prerelease --verify-tag --notes-file docs/releases/v0.1.0-alpha.1.md
```

Expected: GitHub creates a pre-release for the existing tag.

- [ ] **Step 3: Verify release metadata**

Run:

```bash
gh release view v0.1.0-alpha.1 --repo HezLUO/navi --json name,isDraft,isPrerelease,tagName
```

Expected:

```json
{
  "name": "Navi 0.1.0-alpha.1",
  "isDraft": false,
  "isPrerelease": true,
  "tagName": "v0.1.0-alpha.1"
}
```

- [ ] **Step 4: Verify the release tag target**

Run:

```bash
git ls-remote --tags https://github.com/HezLUO/navi.git v0.1.0-alpha.1 'v0.1.0-alpha.1^{}'
```

Expected: peeled tag target remains:

```text
7592e1c7d68bef9e61245b9b7e2dcb8e59955100	refs/tags/v0.1.0-alpha.1^{}
```

### Task 5: Convert Along Into A Lightweight Umbrella Repository

**Files:**
- Modify: `/Users/james/Codex Project/General Codex Project/Along/README.md`
- Modify: `/Users/james/Codex Project/General Codex Project/Along/LICENSE`
- Create: `/Users/james/Codex Project/General Codex Project/Along/docs/vision/along-vision.md`
- Create: `/Users/james/Codex Project/General Codex Project/Along/docs/roadmap.md`
- Create: `/Users/james/Codex Project/General Codex Project/Along/docs/products/navi.md`
- Move: `/Users/james/Codex Project/General Codex Project/Along/docs/superpowers/specs/2026-06-30-navi-repository-split-design.md` to `/Users/james/Codex Project/General Codex Project/Along/docs/decisions/2026-06-30-navi-repository-split-design.md`
- Move: `/Users/james/Codex Project/General Codex Project/Along/docs/superpowers/plans/2026-06-30-navi-repository-split.md` to `/Users/james/Codex Project/General Codex Project/Along/docs/decisions/2026-06-30-navi-repository-split-implementation-plan.md`
- Remove from Along current tree: `.agents/`, `CHANGELOG.md`, `docs/along/`, remaining `docs/superpowers/`, `index.html`, `package-lock.json`, `package.json`, `plugins/`, `scripts/`, `src/`, `tests/`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`

- [ ] **Step 1: Confirm Navi is public before slimming Along**

Run:

```bash
gh repo view HezLUO/navi --json nameWithOwner,visibility,isPrivate,defaultBranchRef
```

Expected: `HezLUO/navi` is public and has default branch `main`. Do not continue if Navi is not public.

- [ ] **Step 2: Create Along umbrella directories**

Run from `/Users/james/Codex Project/General Codex Project/Along`:

```bash
mkdir -p docs/decisions docs/products docs/vision
```

Expected: directories exist.

- [ ] **Step 3: Preserve the split decision and plan in Along**

Run:

```bash
git mv docs/superpowers/specs/2026-06-30-navi-repository-split-design.md docs/decisions/2026-06-30-navi-repository-split-design.md
git mv docs/superpowers/plans/2026-06-30-navi-repository-split.md docs/decisions/2026-06-30-navi-repository-split-implementation-plan.md
```

Expected: both decision files are staged as renames.

- [ ] **Step 4: Remove Navi alpha implementation files from Along current tree**

Run:

```bash
git rm -r .agents CHANGELOG.md docs/along docs/superpowers index.html package-lock.json package.json plugins scripts src tests tsconfig.json vite.config.ts vitest.config.ts
```

Expected: files are removed from the current Along tree. Their history remains in git and in the new Navi repository.

- [ ] **Step 5: Replace root README with Along umbrella copy**

Replace `README.md` with:

```markdown
# Along

Along is the broader product vision for a local-first, open-source companion layer for existing agents.

The current usable product from this vision is **Navi**, an independent open-source alpha that helps non-expert users understand, supervise, and steer expert agents.

Navi now lives at [HezLUO/navi](https://github.com/HezLUO/navi).

## Current Status

Along is an umbrella / vision repository. It explains the long-term product direction and how current and future products relate to it.

This repository is no longer the primary home for Navi alpha installation, release notes, or source verification. Use [HezLUO/navi](https://github.com/HezLUO/navi) for:

- Navi README and quick start;
- Navi GitHub releases;
- source verification commands;
- alpha feedback and issues;
- Navi post-alpha roadmap.

## Product Relationship

```text
Along
  Long-term companion-layer vision for existing agents.

Navi
  First independent V1 alpha product surface from the Along vision.

Progress/Rhythm Maps and Challenge Layer
  Current V1 alpha mechanisms inside Navi.
```

Navi is independent enough to install, test, release, and discuss directly. Along remains the broader product frame for future layers such as reusable Working Thread tooling, Core/MCP, adapters, local runtime, and companion presence.

## Current Products

- [Navi](https://github.com/HezLUO/navi): independent open-source alpha for non-expert supervision of expert agents.

## Docs

- [Along vision](docs/vision/along-vision.md)
- [Roadmap](docs/roadmap.md)
- [Navi product note](docs/products/navi.md)
- [Repository split decision](docs/decisions/2026-06-30-navi-repository-split-design.md)

## Scope

Along is not currently a separate runtime, app, background watcher, marketplace package, or npm package.

## License

MIT. See `LICENSE`.
```

- [ ] **Step 6: Update Along license attribution**

In `LICENSE`, change:

```text
Copyright (c) 2026 Navi Contributors
```

to:

```text
Copyright (c) 2026 Along Contributors
```

- [ ] **Step 7: Add Along vision doc**

Create `docs/vision/along-vision.md` with:

```markdown
# Along Vision

Along is a local-first, open-source companion-layer vision for the agents users already rely on.

The long-term goal is not to replace Codex, Claude Code, Hermes, or other expert agents. Along should help existing agents carry continuity, notice drift, preserve user intent, and make expert work understandable to non-expert users.

## Direction

Along should evolve through small, validated product surfaces:

- user-understandable supervision;
- project continuity;
- drift and risk awareness;
- wrap-up discipline;
- reusable Working Thread tooling;
- optional Core/MCP and adapter layers;
- optional local companion runtime or presence surface.

Each layer needs its own validation before it becomes part of the public product surface.
```

- [ ] **Step 8: Add Along roadmap doc**

Create `docs/roadmap.md` with:

```markdown
# Along Roadmap

Along is currently an umbrella / vision repository.

## Current Product Surface

- Navi: independent open-source alpha at [HezLUO/navi](https://github.com/HezLUO/navi).

## Future Capability Layers

- Reusable Working Thread toolkit.
- Core/MCP interfaces for shared project continuity.
- Existing-agent adapters.
- Local runtime, scheduler, or watcher only after explicit validation.
- Companion presence or UI only after a separate product design pass.

## Current Non-Goals

- Along is not a standalone coding agent.
- Along is not currently an npm package.
- Along is not currently a marketplace package.
- Along does not currently ship a runtime UI or background process.
```

- [ ] **Step 9: Add Navi product note**

Create `docs/products/navi.md` with:

```markdown
# Navi

Navi is the first independent V1 product surface from the broader Along vision.

Use [HezLUO/navi](https://github.com/HezLUO/navi) for the current alpha product repository, source verification, releases, issues, and roadmap.

## Relationship To Along

Along is the long-term companion-layer vision. Navi is the current product surface that makes one part of that vision usable: helping non-expert users understand, supervise, and steer expert agents.

## Current Navi Alpha Scope

Navi's current alpha centers on:

- Progress Maps;
- Rhythm Maps;
- Challenge Layer behavior;
- Working Thread continuity;
- project-local setup guidance.

Navi's current alpha does not include npm publication, marketplace publication, automatic installers, runtime UI, background watcher behavior, or cross-agent adapters.
```

- [ ] **Step 10: Confirm Along public-facing docs do not still present Navi install instructions**

Run:

```bash
rg -n "npm install|verify:plugin-package|plugins/along-working-thread|This repository is the canonical open-source alpha home|This repository is the open-source alpha home" README.md docs/vision docs/products docs/roadmap.md
```

Expected: no output. If output appears, remove the install/source-package wording from Along umbrella docs and point readers to `HezLUO/navi`.

- [ ] **Step 11: Verify Along docs formatting**

Run:

```bash
git diff --check
```

Expected: exit code `0`.

- [ ] **Step 12: Commit Along umbrella conversion**

Run:

```bash
git add README.md LICENSE docs/decisions docs/products docs/vision docs/roadmap.md
git commit -m "docs: convert along to umbrella vision repo"
```

Expected: commit succeeds in `/Users/james/Codex Project/General Codex Project/Along`.

- [ ] **Step 13: Push Along umbrella conversion**

Run:

```bash
git push origin main
```

Expected: `HezLUO/along` main advances to the umbrella conversion commit.

- [ ] **Step 14: Update Along repo description**

Run:

```bash
gh repo edit HezLUO/along --description "Along is the broader companion-layer vision behind Navi and future existing-agent supervision tools."
```

Expected: GitHub repo description is updated.

### Task 6: Public External Validation

**Files:**
- Clone and verify: `/tmp/navi-public-check`
- Clone and verify: `/tmp/along-public-check`
- Verify GitHub remote state: `HezLUO/navi`, `HezLUO/along`

- [ ] **Step 1: Verify unauthenticated Navi repository access**

Run:

```bash
curl -L -I https://github.com/HezLUO/navi
```

Expected: final response includes `HTTP/2 200` or `HTTP/1.1 200`.

- [ ] **Step 2: Verify unauthenticated Navi release access**

Run:

```bash
curl -L -I https://github.com/HezLUO/navi/releases/tag/v0.1.0-alpha.1
```

Expected: final response includes `HTTP/2 200` or `HTTP/1.1 200`.

- [ ] **Step 3: Verify unauthenticated Along repository access**

Run:

```bash
curl -L -I https://github.com/HezLUO/along
```

Expected: final response includes `HTTP/2 200` or `HTTP/1.1 200`.

- [ ] **Step 4: Verify GitHub repo descriptions**

Run:

```bash
gh repo view HezLUO/navi --json nameWithOwner,description,visibility,isPrivate
gh repo view HezLUO/along --json nameWithOwner,description,visibility,isPrivate
```

Expected:

```text
HezLUO/navi is PUBLIC and describes Navi.
HezLUO/along is PUBLIC and describes Along as the broader companion-layer vision.
```

- [ ] **Step 5: Verify Navi release metadata**

Run:

```bash
gh release view v0.1.0-alpha.1 --repo HezLUO/navi --json name,isDraft,isPrerelease,tagName
```

Expected: title is `Navi 0.1.0-alpha.1`, `isDraft` is `false`, `isPrerelease` is `true`, and `tagName` is `v0.1.0-alpha.1`.

- [ ] **Step 6: Fresh clone Navi**

Run:

```bash
test ! -e /tmp/navi-public-check && git clone --depth 1 https://github.com/HezLUO/navi.git /tmp/navi-public-check
```

Expected: `/tmp/navi-public-check` is created from the public repository. If the path already exists, inspect and remove it only after confirming it is disposable.

- [ ] **Step 7: Verify Navi from public clone**

Run from `/tmp/navi-public-check`:

```bash
npm install
npm run verify:plugin-package
npm run typecheck
npm test
```

Expected: all commands exit `0`. `npm install` accesses the npm registry and requires user approval or approved escalation in the Codex sandbox.

- [ ] **Step 8: Fresh clone Along**

Run:

```bash
test ! -e /tmp/along-public-check && git clone --depth 1 https://github.com/HezLUO/along.git /tmp/along-public-check
```

Expected: `/tmp/along-public-check` is created from the public repository. If the path already exists, inspect and remove it only after confirming it is disposable.

- [ ] **Step 9: Verify Along is umbrella-only from public clone**

Run from `/tmp/along-public-check`:

```bash
test -f README.md
test -f docs/products/navi.md
test ! -f package.json
test ! -d plugins
rg -n "HezLUO/navi|Along is the broader product vision" README.md docs/products/navi.md
```

Expected: all `test` commands exit `0`; `rg` prints lines that point readers to `HezLUO/navi` and describe Along as the broader vision.

- [ ] **Step 10: Verify Navi source archives are available**

Run:

```bash
curl -L -I https://github.com/HezLUO/navi/archive/refs/tags/v0.1.0-alpha.1.zip
curl -L -I https://github.com/HezLUO/navi/archive/refs/tags/v0.1.0-alpha.1.tar.gz
```

Expected: final response for each archive includes `HTTP/2 200` or `HTTP/1.1 200`.

### Task 7: Final Migration Report

**Files:**
- Verify only: `/Users/james/Codex Project/General Codex Project/Along`
- Verify only: `/Users/james/Codex Project/General Codex Project/Navi`

- [ ] **Step 1: Capture final local states**

Run:

```bash
git -C "/Users/james/Codex Project/General Codex Project/Along" status -sb
git -C "/Users/james/Codex Project/General Codex Project/Navi" status -sb
git -C "/Users/james/Codex Project/General Codex Project/Along" log --oneline -3
git -C "/Users/james/Codex Project/General Codex Project/Navi" log --oneline -3
```

Expected: both worktrees are clean and each `main` tracks its own `origin/main`.

- [ ] **Step 2: Report the split outcome**

Final response should include:

```text
Created/verified: HezLUO/navi public repository.
Preserved: git history and v0.1.0-alpha.1 tag.
Created/verified: Navi 0.1.0-alpha.1 GitHub pre-release.
Updated: Navi README/package metadata to make HezLUO/navi canonical.
Updated: HezLUO/along into lightweight umbrella / vision repository.
Verified: public clone and npm checks for Navi, public clone checks for Along.
Deferred: internal id rename, npm release, marketplace release, installer, runtime/UI, background watcher, adapters.
```

Include any command that could not be run, with the concrete reason and the exact remaining command.
