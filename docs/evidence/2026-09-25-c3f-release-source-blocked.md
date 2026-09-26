# C3-F release publication — source-blocked finding (2026-09-25)

**Scope:** C3-F "Living Release Publication", Task 2 (build the release source adapter) and therefore Tasks 3–5 (release index/story page, homepage/product signal, inflation red-team).
**Verdict:** `BLOCKED` — blocked on owner-supplied product/release truth, not on engineering capacity.
**Authority:** `docs/superpowers/plans/2026-09-13-c3-f-living-release-publication.md` §Task 2 Step 1: _"If no reliable source exists, mark C3-F source-blocked and do not fabricate sample production releases."_

## What was attempted

Task 2 requires a **pure adapter** that maps _explicitly approved_ release/changelog/source records into validated public release-story candidates (`parseReleaseStory` from `src/lib/release-schema.ts`, merged as C3-F Task 1 in PR #266 / `4efb49b`). The adapter has no prose-generation authority: it may map real records, it may never invent a release.

The source-selection step ran as a judgement gate before any test or implementation. No file was created and nothing was committed, because no admissible source exists.

## Evidence (verified on `main` 2026-09-25)

| Claim                                                   | Evidence                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No approved product records exist                       | `src/content/products/` contains only `README.md`                                                                                                                                                                                                                                                                           |
| The product publication state is explicitly unpublished | `src/data/integrity.ts:159` → `state: "not-published"` (vocabulary at `src/data/integrity.ts:12` includes `"not-published"`)                                                                                                                                                                                                |
| A missing fact must never be guessed                    | `src/data/trust-ledger.ts:16` — _"A missing fact is `not-published` — never a guessed assurance status."_                                                                                                                                                                                                                   |
| The authored edition makes no release statement         | `src/data/editions.ts:7` — _"…creates a product, claim, evidence or release statement: the ids below must…"_                                                                                                                                                                                                                |
| No other release/changelog source is tracked            | `git ls-files` matches exactly one changelog: `brand/blueskyz-production-v4/00_START_HERE/CHANGELOG_v4.md` — a **brand-kit asset** changelog (dated asset release, no product slug, no canonical source revision/URL, no release-evidence mapping), so it cannot populate `ReleaseStoryInput` without inventing the mapping |
| The build agrees the collection is empty                | `pnpm build` on this branch logs `The collection "products" does not exist or is empty`                                                                                                                                                                                                                                     |

## Why this is the correct outcome

Mapping the brand-kit changelog (or any hand-written sample) into `ReleaseStoryInput` would have required fabricating a product slug, a canonical source revision/URL and a release-evidence link — i.e. inventing product truth on a public surface. The C2/C3 doctrine and `AGENTS.md` forbid exactly that, and the release surface would have published assurance the repository cannot support.

## What is NOT claimed

- No release index, story page, homepage or product-page release signal was built. Task 3, Task 4 Steps 2–3 and Task 5 remain unstarted; Task 4 Step 1 is now covered by the empty-state regression below.
- No sample, fixture or placeholder production release was created anywhere.
- C3-F Task 1 (schema) is complete and unaffected; it validates releases whenever a real source exists.

## What unblocks it (owner action)

An owner-approved public release source, e.g. authored release records carrying product slug, canonical source revision + URL, publication state and the evidence each change cites. Once such a source exists, Task 2 can map it with the existing schema and the remaining tasks follow.

## Related

- Plan: `docs/superpowers/plans/2026-09-13-c3-f-living-release-publication.md`
- Task 1 (merged): PR #266 → `4efb49b`
- Router update: `docs/current-work.json` (wave `c3-f-release` = `BLOCKED`, with the owner-fact item in `residualExternal`)

## Supplemental empty-state regression — 2026-09-26

- Added `tests/e2e/c3-release-empty-state.spec.ts` to assert that EN/VI home and product-index pages render no release signal while the public product registry has no product cards.
- Mutation proof: inserting `<div data-release-signal>Upcoming release</div>` into the EN homepage made the Chromium test fail with expected count `0`, received `1`. The marker was removed; a clean `pnpm build` and the same test passed (1/1).
- The mutation was temporary and is not part of the source diff. Local Node was v24.17.0 while the repo requires >=24.20.0; exact-head PR Source Assurance remains the promotion gate.
