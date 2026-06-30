# Navi Repository Split Design

Date: 2026-06-30
Status: Approved design, pending implementation plan

## Summary

Navi should become its own independent open-source product repository at `HezLUO/navi`, while `HezLUO/along` should remain public as a lightweight umbrella and long-term product vision repository.

This split resolves the current public-facing mismatch: the repository is named `along`, but the alpha README and release surface are already Navi-first. The new structure lets external readers understand Navi as the current product while preserving Along as the broader companion-layer vision that produced it.

## Confirmed Decisions

- `HezLUO/navi` becomes the user-facing open-source product repository for the current alpha.
- The new `navi` repository should preserve the current git history.
- `HezLUO/along` remains public, but becomes a lightweight umbrella / vision repository.
- Alpha-stage internal identifiers remain unchanged for compatibility, including `along-working-thread`, `.agents/skills/along-working-thread`, and `docs/along/`.
- The new Navi README should be Navi-first and include a clear first-screen relationship statement: Navi is an independent open-source product and the first V1 product surface from the broader Along vision.

## Product Hierarchy

The split should use this hierarchy:

```text
Along
  Long-term product vision:
  a local-first, open-source companion layer for existing agents.

Navi
  Independent open-source product:
  the current V1 alpha product surface from the Along vision.

Progress/Rhythm Maps and Challenge Layer
  Current V1 alpha mechanisms inside Navi.

Working Thread
  Internal continuity substrate and compatibility name in the alpha package.
```

Navi should not be presented as merely a feature inside Along. Along should not be presented as the active alpha product repository. The relationship is: Navi is independent enough for users and contributors to understand, install, test, and discuss directly, while Along remains the parent vision and future capability frame.

## Repository Roles

### `HezLUO/navi`

`HezLUO/navi` should be the primary home for the current alpha product:

- root README, release notes, install guidance, validation instructions, and roadmap are Navi-first;
- GitHub description describes Navi directly;
- issues and releases are the canonical public product surface for Navi alpha feedback;
- existing tags, especially `v0.1.0-alpha.1`, are preserved or recreated against the same commits;
- the release page is recreated or verified as a Navi pre-release;
- the README explains the compatibility names that still contain `along`.

The first-screen positioning should be direct:

```text
Navi helps non-expert users understand, supervise, and steer expert agents.

Navi is an independent open-source product and the first V1 product surface
from the broader Along vision. Along is the long-term companion-layer vision;
Navi is the current alpha product you can inspect, install, and test today.
```

### `HezLUO/along`

`HezLUO/along` should become a lightweight umbrella / vision repository:

- README explains the Along vision and points to `HezLUO/navi`;
- docs focus on product hierarchy, future capability layers, and why Along exists;
- Navi is listed as the first V1 product surface;
- the repository does not remain the primary place for Navi alpha install, release, or verification instructions.

Along should not be archived in this design. Keeping it alive preserves the long-term product narrative and leaves room for future layers such as reusable Working Thread tooling, Core/MCP, adapters, local runtime, or companion presence.

## Migration Content Boundary

The `navi` repository should receive the current alpha product source and evidence:

- `README.md`
- `CHANGELOG.md`
- `LICENSE`
- `package.json` and `package-lock.json`
- `.agents/skills/along-working-thread/`
- `plugins/along-working-thread/`
- `scripts/`
- `tests/`
- `src/` if current verification depends on it
- `docs/along/project-maps/`
- `docs/along/navi-product-debt.md`
- `docs/along/roadmaps/navi-post-alpha-roadmap.md`
- Working Thread records that directly explain Navi alpha behavior, validation, release, or roadmap decisions

The `along` repository should retain or gain lightweight vision material:

- `README.md` for Along vision and the relationship to Navi;
- `docs/vision/` or equivalent future-facing docs;
- `docs/roadmap.md` or equivalent umbrella roadmap;
- a short `docs/products/navi.md` page pointing to `HezLUO/navi`;
- links to Navi README, releases, issues, and roadmap.

The implementation plan may choose whether to create `navi` by pushing the full current repository as-is first, then slimming `along`, or by preparing a filtered working copy before first push. The required outcome is that Navi keeps the alpha history and Along becomes clearly secondary for the alpha product surface.

## Compatibility Strategy

Do not rename internal identifiers during this split.

Keep these compatibility names for the alpha:

- package / plugin path: `along-working-thread`
- skill id: `along-working-thread`
- source path: `.agents/skills/along-working-thread`
- current docs path: `docs/along/`

The Navi README should explain that these are legacy/internal compatibility names from the Along-origin alpha package, not the user-facing product name. A full rename to `navi-working-thread`, `docs/navi/`, or new skill ids should be evaluated later, likely for a `0.2` or installer-focused release.

This avoids combining two risky migrations:

- public repository split;
- behavior-critical path and skill identifier rename.

## GitHub Release Strategy

`HezLUO/navi` should become the canonical public release surface:

- create the repository as public;
- push the current main branch with history;
- push existing tags, including `v0.1.0-alpha.1`;
- recreate or verify a GitHub pre-release named `Navi 0.1.0-alpha.1`;
- confirm the release tag points to the intended commit;
- make source archives publicly accessible.

`HezLUO/along` should remain public but stop acting as the primary Navi release surface:

- update its README with a top-level migration note;
- point readers to `HezLUO/navi` for current Navi alpha use;
- keep existing tags/releases available unless there is a specific reason to hide them;
- avoid deleting history or breaking old links.

## Validation Requirements

The split is complete only when it passes both reader and developer checks.

Reader checks for `HezLUO/navi`:

- a new visitor can understand what Navi is within 2-3 minutes;
- the README explains how Navi relates to Along;
- alpha install and verification paths are easy to find;
- current non-goals are explicit: no npm release, no marketplace release, no installer, no runtime UI, no background watcher;
- release pages use Navi-first language.

Developer checks for `HezLUO/navi`:

- unauthenticated public access returns success for the repository and release page;
- a fresh clone succeeds;
- `npm install` succeeds from the public clone;
- `npm run verify:plugin-package` passes from the public clone;
- `npm run typecheck` passes from the public clone;
- `npm test` passes, or any narrower alpha verification scope is explicitly justified;
- tags and releases point to the intended commits.

Safety checks before or during publication:

- scan tracked files for obvious secret, token, key, and `.env` patterns;
- confirm the worktree is clean before pushing;
- avoid exposing private target-project material that is not part of the Navi alpha product surface.

## Risks And Controls

Risk: both repositories look like the product home.

Control: make `along` a short umbrella / vision repository and make `navi` the only README/release path for alpha use.

Risk: `along-working-thread` compatibility names confuse early readers.

Control: explain the naming as alpha compatibility and defer path renames to a later release.

Risk: release evidence is split or lost.

Control: preserve git history and tags in `navi`; leave a migration note in `along` instead of deleting old records.

Risk: the split turns into a broad refactor.

Control: keep this pass focused on repository ownership, public docs, tags, releases, and verification. Do not change behavior-critical skill logic during the split.

## Non-Goals

This design does not include:

- renaming `along-working-thread` to `navi-working-thread`;
- changing skill ids, plugin ids, or behavior-critical paths;
- npm publication;
- public Codex marketplace publication;
- automatic installer work;
- UI, runtime, scheduler, watcher, notification, or background autonomy;
- Along Core/MCP implementation;
- cross-agent adapters;
- issue template, governance, or community-process buildout beyond what is needed for alpha clarity.

## Implementation Planning Notes

The next step is an implementation plan, not immediate migration. The plan should break the work into phases:

1. prepare and verify the current source state;
2. create and publish `HezLUO/navi` with history, tags, and release;
3. update `HezLUO/along` into an umbrella / vision repository;
4. perform public clone and release-page validation;
5. record the final migration result and any deferred cleanup.

Any action that creates repositories, changes GitHub visibility, pushes tags, recreates releases, or installs dependencies from a public clone requires an explicit execution step with verification.
