# C2 P0 — Product truth activation

Date: 2026-09-13 (Asia/Ho_Chi_Minh)
Branch: `feat/c2-p0-router` (base `386aaac`, C2 planning merge #157)
Status: **BLOCKED_OWNER_FACT** for product activation; router + honest record delivered.

## Task 1 — live refresh and C2 execution router

- Live `main` at execution start: `386aaac` (`docs(c2): approve Cinematic Product
House design + execution plan (#157)`) — the planning PR, merged only after
  exact-head `Quality Gates` + `Browser Assurance` were both SUCCESS and the PR
  was conflict-free (`mergeable_state: clean`). No ruleset bypass.
- `docs/current-work.json` now carries the C2 program: exactly one active wave
  (`c2-p0`, IN_PROGRESS) and `c2-p1 … c2-p6` PLANNED, each pointing at the
  approved implementation plan as its current evidence until runtime evidence
  exists. Owner decisions and external/human residuals preserved.
- `tests/architecture/current-work-router.test.mjs` → **6/6 pass** (one active
  wave, bounded statuses, owner items never auto-promoted).

## Task 2 — screenshot floor inventory (no product invented)

Facts inspected, not assumed:

| Fact source                  | Observed state                                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `src/content/products/`      | Only `README.md` — **zero product entries**                                                                      |
| `public/products/`           | **Directory does not exist** — no real screenshot asset anywhere in the repo                                     |
| `src/lib/product-schema.ts`  | `proof.screenshot` optional; public path requires 2–3 capabilities; local `/products/...` path enforced by regex |
| Owner-approved product facts | None available in this session                                                                                   |

**Determination: `BLOCKED_OWNER_FACT`.** No candidate has the minimum truth a
public listing requires — owner-approved identity/outcome, lifecycle,
availability, primary action, **a real screenshot asset**, 2–3 verified
capabilities, proof destinations, and an authored review date. Per the C2 hard
prohibitions and the repository's fail-closed product contract, no public record
was created and no placeholder asset was added.

Consequences, stated honestly:

- The public registry stays **empty** — a truthful state, not a defect.
- The P0 runtime change (flip `productScreenshot.optional()` → required inside
  the public path) **must not** land before assets exist: flipping it with an
  empty registry changes nothing observable and risks blocking the first real
  listing authored by someone who cannot produce a screenshot in that moment.
  The scaffold (`tests/architecture/product-screenshot-floor.test.mjs`) keeps
  the contract pinned and the `OPEN DECISION` marker documents the exact flip.
- C2 structural shells (P1 onward) proceed against the **empty-registry
  fallback**, so no cinematic surface can depend on fabricated product data.

## Evidence (local, exact this branch)

- `node --test tests/architecture/current-work-router.test.mjs` → **6/6 pass**
- `pnpm test:architecture` → run in the P0 PR; `pnpm check:product-provenance` reports `IDLE (0 published products)`

## Residual (owner)

Supply, per product: real identity, customer outcome, lifecycle, availability,
primary action, **real screenshot under `public/products/<slug>/`**, 2–3 verified
capabilities, proof destinations, source revision, authored review date. Then
the floor flip is one line plus the record — no design work required.
