# Wave H2 — hardening: provenance, promotion state, semantics, density

Date: 2026-09-12
Branch: `feat/wave-h2` (base `f7636a7`)
Status: **VERIFYING** — local gates green; awaiting exact-head Source Assurance.

## Scope

Follow-on hardening derived from the two read-only recon briefs over owner PRs
#125 (v3.1 design) and #126 (principal red-team plan), executed as one wave with
four isolated sub-agent worktrees plus the orchestrator lane.

| Track  | Artifact                                                                       | Owner lane              | Status                |
| ------ | ------------------------------------------------------------------------------ | ----------------------- | --------------------- |
| T2     | `scripts/verify-git-evidence.mjs` + `git-evidence.test.mjs`                    | h2a (isolated worktree) | DETECTED → REMEDIATED |
| T4     | `scripts/check-promotion-state.mjs` + test                                     | h2b                     | REMEDIATED            |
| T7     | `scripts/validate-deployment-evidence.mjs` + test                              | h2b                     | REMEDIATED            |
| T8/C3  | `src/lib/public-state-semantics.ts` + test                                     | h2c                     | REMEDIATED            |
| T12/C9 | `tests/architecture/experience-density.test.mjs` + `docs/evidence/templates/*` | h2d                     | REMEDIATED            |
| T1     | `docs/current-work.json` + `current-work-router.test.mjs`                      | orchestrator            | REMEDIATED            |
| T11    | `tests/architecture/integrity-evidence-topology.test.mjs`                      | orchestrator            | REMEDIATED            |
| C6     | assurance vocabulary extension in the integrity firewall                       | orchestrator            | REMEDIATED            |
| UI-4   | footer re-grid + integrity-lens legend (EN/VI)                                 | orchestrator            | REMEDIATED            |

## Real defects the wave closed

1. **Provenance could false-green.** The previous architecture check asserted only
   `existsSync(path)` plus a SHA _shape_ regex — a blob SHA or any 40-hex string
   passed. Now every cited revision is resolved with `git cat-file -e <rev>^{commit}`
   and every cited path with `<rev>:<path>` (`verify:git-evidence` →
   `Git evidence: PASS (7 entries)`), and absence in a shallow clone reports
   `SHALLOW_UNVERIFIED`, never PASS.
2. **Circular evidence in the Integrity Lens.** `products-publication` cited only
   its own surface page. It now cites the machine-verifiable public manifest
   (`/.well-known/sgps.json`) and a guard bans any entry whose whole evidence set
   is its own page.
3. **Unlinked state vocabularies.** 27 public states across `product-schema.ts`,
   `trust-ledger.ts` and `integrity.ts` had no canonical meaning model; 18 explicit
   forbidden over-readings are now encoded (e.g. `available` ⇏ `reviewed`,
   `source-linked` ⇏ `certified`) with a blanket ban on assurance claims.
4. **No honest current-work router.** `docs/current-work.json` + contract now carry
   bounded statuses, real evidence paths, WIP control, and the open owner decisions.
5. **Orphaned provenance caught by CI (round 2).** The first exact-head run failed
   honestly: `architecture/sgps-model.json` cited two commits (`6442ce0c…` for
   `src/`, `15094e5a…` for `.github/workflows/quality-gates.yml`) that squash merges
   had orphaned from the promoted history — they resolved in a developer clone with
   PR refs, but not in the candidate checkout. Both now cite the last commit on
   `origin/main` that touched their path (`f7636a7…`, and `7600db7a…` for
   `src/lib/truth.ts`), and `verifyAncestry` (`git merge-base --is-ancestor`) makes
   this class of drift fail-closed instead of merely unresolvable.

## Evidence (local, exact this branch)

- `pnpm test:architecture` → **263 pass / 0 fail**
- `pnpm verify:git-evidence` → `Git evidence: PASS (7 entries)`
- `pnpm check:promotion-state` → `source PASS, deployment PASS, public-truth BLOCKED_OWNER_FACT` (exit 0; owner facts empty by design)
- `pnpm check:deployment-evidence` → `Deployment evidence: PASS (64285ac)`
- `pnpm lint` / `pnpm format:check` / `pnpm build` / `pnpm check:client-budget` /
  `pnpm check:static-links` / `pnpm check:publishability` / `pnpm check:integrity-firewall` → all PASS
- Client JS budget: site-wide **2 567 B**, worst page 2 036 B (< 120 000 B)
- Density baselines recorded in the guard: CTA/section 4 (ceiling 5), homepage CTA 11 (ceiling 12), longest heading 29 chars (ceiling 40), sections/page 10 (ceiling 12)

## Residual risk (carried honestly)

- `verify:git-evidence` requires a full checkout: Source Assurance now sets
  `fetch-depth: 0`; a shallow checkout fails loudly instead of false-greening.
- `check:promotion-state` mirrors the canonical host constant with
  `scripts/smoke-production.mjs` (two places to change if the domain moves).
- Deployment evidence accepts an abbreviated SHA (7–40 hex) because the real
  read-back ledger records `64285ac`; a 40-hex token is preferred when present.
- Density and state-semantics guards are static proxies: they cannot see the
  rendered DOM, zoom/overflow behaviour, or human comprehension.
- **Human E4 remains NOT RUN.** Templates exist (`docs/evidence/templates/`);
  automated evidence does not substitute for real participant evidence.

## Owner decisions still open

Recorded in `docs/current-work.json` → `openOwnerDecisions`:
reconcile/supersede #125 and #126 (the #126 tip carries a debug test that blocks
its own merge), the screenshot-mandatory-vs-optional product floor, human-review
governance, and the analytics/RUM provider choice.
