# Wave H5 — documented gate surface + runtime re-probe

Date: 2026-09-12
Branch: `feat/wave-h5` (base `444fcce`, squash of wave H4 / #142)
Status: **VERIFYING** — local gates green; awaiting exact-head Source Assurance.

## Findings

1. **Documentation drift (real).** `docs/QA_STRATEGY.md` still described the
   pre-v3 gate set: six assurance gates merged in H1–H4
   (`check:publishability`, `check:integrity-firewall`, `verify:git-evidence`,
   `check:promotion-state`, `check:deployment-evidence`,
   `check:product-provenance`) were absent from the strategy document, and the
   `fetch-depth: 0` provenance requirement and `BLOCKED_OWNER_FACT` semantics
   were undocumented.
2. **Stale `dist` caught by a runtime probe.** A real-Chromium probe against the
   local preview reported missing `BreadcrumbList` on every route — because the
   served `dist` predated the H3 merge. Rebuilding produced PASS. The probe
   result was correct; the workspace was stale.

## What changed

- **`docs/QA_STRATEGY.md`** now lists the real Quality Gates order, the
  `fetch-depth: 0` requirement (provenance resolves revisions to real commit
  objects reachable from the candidate), `BLOCKED_OWNER_FACT` semantics, the
  deployment-evidence validator, the product-provenance `IDLE` behaviour, and
  the machine-readable security surface.
- **`tests/architecture/scripts-documented.test.mjs`** keeps three artifacts in
  sync: every `check/verify/validate:` script must be documented; every CI gate
  step must be documented and present in the workflow (or carry a written
  deploy-time exception — `validate:public-truth`, which runs in the promotion
  path, not in the secretless workflow); and the documented order must match CI
  order.

## Runtime verification (real Chromium, local preview of the current dist)

- `/en/about/`, `/vi/privacy/`, `/en/decision-room/`, `/vi/` at **320 px and 390 px**:
  no horizontal overflow, `BreadcrumbList` present exactly where expected (absent
  on Home), ≥ 3 hreflang links per page, skip-link target `#main-content`.
- `localStorage` / `sessionStorage` / cookies after using the Decision Room:
  **empty** (no storage, no cookies).
- Live host re-check: `robots.txt` (allow + sitemap reference) and `sitemap.xml`
  (**20 URLs**: 16 static + 4 evidence passports, EN/VI parity) served as expected;
  no `@font-face` at all — the site ships zero webfont downloads.

## Evidence (local, exact this branch)

- `pnpm test:architecture` → **291 pass / 0 fail**
- `pnpm lint` clean; runtime probe → `Runtime probe: PASS`
- `dist/en/about/index.html` contains exactly one `BreadcrumbList`

## Residual risk

- The probe is a script under `.hermes/exp-audit/` (git-ignored): it is evidence,
  not a gate. Durable equivalents live in the e2e suites.
- `scripts-documented` parses the workflow textually; a workflow restructure
  with different syntax would need the parser updated (it fails loudly rather
  than silently passing).
