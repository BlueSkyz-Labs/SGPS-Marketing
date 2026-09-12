# Hardening program H1–H13 — consolidated ledger

Date: 2026-09-13 (Asia/Ho_Chi_Minh)
Program: hardening waves that followed the merged v3 "God-tier trust
experience" program, driven by two read-only recon briefs over owner PRs #125
and #126 plus successive deep-audit passes.

## Wave map (all merged to `main`; SHAs are squash merge commits)

| Wave | PR   | SHA       | Finding → fix → guard                                                                                                                                                                                                                                                                                                                                                                                             |
| ---- | ---- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1   | #138 | `f7636a7` | Playwright bootstrap could exit 0 without browsers → fail-closed install + real launch smoke of all three engines; deploy gate `validate:public-truth`; product deep links; brand fidelity guards (APPLE maskable/browserconfig/registry/easing)                                                                                                                                                                  |
| H2   | #139 | `83f5039` | **CI caught fake provenance**: `sgps-model.json` cited two commits orphaned by squash merges → re-pointed to durable `origin/main` commits + `verifyAncestry`; git-evidence verifier; promotion-state (`BLOCKED_OWNER_FACT` semantics); deployment-evidence validator; 27-state public semantics with 18 forbidden over-readings; experience-density guard; `docs/current-work.json` router; integrity anti-cycle |
| H2b  | #140 | `caf0719` | Deploy contract (order, no swallowed failures, no secrets, Actions stays source-assurance-only); public assurance-language scanner found a real over-claim ("Reliable, secure, consistent.") → copy now states only verifiable facts; navigator no longer treats a JSON artifact as a destination                                                                                                                 |
| H3   | #141 | `8aded4b` | BreadcrumbList JSON-LD from declared labels only; reduced-motion contract (nothing may out-rank the neutraliser); product provenance guard (`sourceRevision` must resolve, `IDLE` not a silent pass)                                                                                                                                                                                                              |
| H4   | #142 | `444fcce` | `/.well-known/security.txt` (RFC 9116, advisory channel the site already declares); edge-header contract (CSP `script-src 'self'`, HSTS, nosniff, DENY, Permissions-Policy, preview noindex)                                                                                                                                                                                                                      |
| H5   | #143 | `8203ae7` | **Documentation drift** (six gates undocumented) → QA_STRATEGY rewritten to the real gate surface + `scripts-documented` drift guard; real-Chromium probe caught a stale `dist`                                                                                                                                                                                                                                   |
| H6   | #144 | `475ea7b` | Print surface: site chrome removed from paper, evidence detail expanded, dead navigation link hidden in print                                                                                                                                                                                                                                                                                                     |
| H7   | #145 | `3f50746` | **Evidence passport pages had no `h1`** (30-page markup sweep) → document title added; `markup-baseline` spec (one h1, lang, canonical, description)                                                                                                                                                                                                                                                              |
| H8   | #146 | `c7d2aa5` | **Heading-order skips** on privacy/security → corrected hierarchy (0 issues across 30 pages); **mobile overflow sweep** (40 checks, 320/390px); passport polish from an independent vision review (2 of 6 flags disproven by measurement)                                                                                                                                                                         |
| H9   | #147 | `3115202` | Command navigator filtered silently for assistive tech → polite live region with localized result counts                                                                                                                                                                                                                                                                                                          |
| H10  | #148 | `5194e15` | **Rollback contract document never existed** (required by S+ Task 12C) + **smoke never checked the branded 404** → operations contract + live 404 check (three paths, > 5 KB, branded content)                                                                                                                                                                                                                    |
| —    | #150 | `d83711e` | Post-merge production read-back ledger; deployment-evidence tests made ledger-agnostic                                                                                                                                                                                                                                                                                                                            |
| H12  | #151 | `b3e0021` | **Text-zoom (WCAG 1.4.4) overflow found live**: contact cards could not shrink, trace steps pinned min-content, the security h1 could not break, **and CI (Linux metrics) exposed atlas rows that could not wrap** → all fixed; `text-zoom` spec sweeps 16 routes at 390px × 200%; offender attribution ignores clipped decoration                                                                                |
| H13  | #152 | —         | Clean probe (1.4.12 text spacing, forced colors) → guards locked in (`text-spacing`, `forced-colors`); no production change                                                                                                                                                                                                                                                                                       |

## Runtime verification standing (production = https://blueskyzlabs.com)

- `node scripts/smoke-production.mjs` with `SMOKE_COMMIT_SHA` → **ALL PRODUCTION SMOKE CHECKS PASS**, including the branded 404 on EN/VI/root paths and `/.well-known/security.txt`.
- Edge header set read back live (HSTS, CSP, Permissions-Policy, Referrer-Policy, nosniff, DENY).
- `pnpm audit` (full + production) → no known vulnerabilities.
- `pnpm verify:git-evidence` → every cited revision resolves to a real commit reachable from the candidate.

## Owner decisions still open (tracked in `docs/current-work.json`)

1. Reconcile or supersede owner PRs **#125** (v3.1 design) and **#126** (principal red-team plan; its tip carries a debug test that blocks its own merge).
2. The **screenshot-mandatory floor** (C1c of #125) contradicts the live product schema (#126 T3 keeps a screenshot optional) — pick one.
3. **Human review governance** — enable stronger rules only if a real independent reviewer path exists.
4. **Analytics/RUM provider** — transmission stays off until a privacy decision exists.

## External / manual residuals

- **Human E4 remains NOT RUN** (real participants; protocol at `docs/evidence/2026-09-12-v3-human-e4.md`).
- Vietnamese copy: the three weakest spots were rewritten in the UI program; a native-speaker review of the remainder still needs a human.
- Rollback execution is provider-private (Cloudflare dashboard) — documented, anchored to verification steps, owner-executed.

## Honest limits of this evidence

- An automated/browser pass is **not** a substitute for real-user comprehension evidence.
- Density, semantics and provenance guards are static proxies: they detect drift, not experience quality.
- Two independent review flags in H8 ("10px grid misalignment", "future review date") were disproven by measurement (alignment at 92px; `date` confirms 2026-09-12); review signal is evidence only when reproduced.
