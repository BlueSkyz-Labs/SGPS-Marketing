# Wave H11 — recovery paths and redirect contract

Date: 2026-09-12
Branch: `feat/wave-h11` (base `3115202`, squash of wave H9/H10 merges)
Status: **VERIFYING** — local gates green; awaiting exact-head Source Assurance.

## Finding

Failure/recovery was an unasserted QA/QC dimension:

1. **Recovery links on the 404 page were never exercised.** The page promises
   "Go home / Browse products / Security" in both locales; nothing proved those
   destinations exist, answer 200, and show the page they promise. (The earlier
   blank-404 P0 made it clear this surface deserves an active guard, not faith.)
2. **No redirect-chain guard existed.** `public/_redirects` is hand-maintained;
   a future edit could land a legacy URL on another redirect (a chain that later
   rots) without any gate noticing.
3. **Local-vs-production redirect divergence was undocumented in tests.** The
   preview (and CI browser matrix) does not execute `_redirects` — that is a
   Cloudflare Workers feature — so local checks see the meta-refresh stubs.
   The spec now states this explicitly and verifies where the visitor ends up,
   while production 301s remain covered by `smoke-production`.

## What changed

- `tests/architecture/redirect-contract.test.mjs`: the table must be permanent
  (301), land on localized canonicals, contain the full legacy set, and have
  **no chains** (no destination is itself a source).
- `tests/e2e/recovery-paths.spec.ts`: for EN and VI, every recovery link on the
  404 page must be visible, answer 200, and show a non-empty h1 (pinned for
  products/security); the legacy `/about/` URL must recover to `/en/about/` with
  its real heading ("Who we are"). This ran green **after** two honest
  corrections: the pinned headings were measured from the built output rather
  than guessed, and the hop assertion accepts the local meta-refresh stub while
  documenting the production 301.

## Evidence (local, exact this branch)

- `pnpm exec playwright test tests/e2e/recovery-paths.spec.ts --project=chromium --workers=1` → **3/3 pass**
- `pnpm test:architecture` → **299 pass / 0 fail** on this branch (303 once wave H10 lands: 300 + this wave's 3)

## Residual risk

- The e2e runs against the preview's stub behaviour; genuine HTTP-redirect
  semantics are provider-side and remain smoke-verified in production.
- Recovery coverage covers the paths the 404 page advertises; a future added
  link is caught by the "visible + 200" loop only if the spec list is updated
  (the 404 markup is small and reviewed).
