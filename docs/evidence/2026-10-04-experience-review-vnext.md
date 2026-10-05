# Experience review — vNext deployment + C3-E concierge surface (2026-10-04)

- **Lens:** SGPS Experience v4.0.0 (vNext experimental) under the Common Execution Kernel; phase
  REVIEW routed via `sgps_prompt_route_vnext.py route --phase REVIEW --surfaces ui,accessibility,navigation,i18n`
  → **master + experience** (the deterministic router's own selection).
- **Bound to:** `main@fd6d29b6` + the local production-origin build of `feat/c3e-task5-concierge-ui`
  (stacked on `feat/c3e-task2-corpus`, PR #499). **Rendered evidence:** fresh `astro preview`
  (:3001) + the new e2e suite 7/7; source/build: astro check 0/0 (242 files).

## E1 — Current rendered reality (delta scope)

The only rendered delta this wave is the **C3-E concierge surface on /verify/** (×4 locales):

| Check                                                           | Result                                                     |
| --------------------------------------------------------------- | ---------------------------------------------------------- |
| Renders with 7 corpus records as ordinary links                 | PASS (curl + e2e)                                          |
| Locale labels (vi/zh/zh-hant placeholders + kind labels)        | PASS (curl: "Tìm trang…" / "搜索页面…" / "搜尋頁面…")      |
| No-JS baseline (full navigation list, content contract)         | PASS (e2e, JS-disabled context)                            |
| Filter (substring, diacritic-insensitive, empty state, restore) | PASS (e2e; VI "so tro" matches "Sổ Trọ")                   |
| Keyboard (focus + type)                                         | PASS (e2e)                                                 |
| Material grammar (tokens, focus visibility, `[hidden]` honored) | PASS after the styling commit — verified in the served CSS |

## Findings

| ID  | Verdict                  | Finding                                                                                                                             | Disposition                                                                                                                                                                                                                                                                                                                              |
| --- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| X-1 | IMPROVE → fixed in-wave  | The surface initially rendered **unstyled** — functional but not the site's material grammar (E4 premium = clarity/calm/precision). | Styled with the existing tokens (mirroring the Command Navigator block) incl. the critical `.concierge__item[hidden]{display:none}` so `display:flex` cannot defeat the filter's `hidden` attribute; e2e re-run 7/7 with styles live.                                                                                                    |
| X-2 | KEEP (deliberate split)  | The concierge overlaps the Command Navigator (both = deterministic search over site truth).                                         | Accepted split: the navigator is the global palette (routes/products/trust/evidence, Cmd+K); the concierge is the trust-surface corpus search (claims/evidence/records, inline). They share filter semantics and copy deliberately — consolidation (feeding the navigator from the corpus) is recorded as a future option, not a defect. |
| X-3 | PASS                     | Accessibility of the new surface.                                                                                                   | sr-only label, `role=status` live region with templates, keyboard operable, 2.5rem+ link targets, focus-visible styles; the CI axe matrix will re-assert on the PR.                                                                                                                                                                      |
| X-4 | NOT_VERIFIED (by design) | Visual/interaction beyond the local preview.                                                                                        | The PR's exact-head Browser Assurance + visual gate are the authoritative rendered evidence; this review is pre-merge preflight.                                                                                                                                                                                                         |

## vNext A/B — first data point (self-scored against the runbook's 10 criteria)

1. Live refresh before analysis — **yes** (repeated; LIVE TRUTH snapshots at each checkpoint).
2. Exact HEAD binding — **yes** (`fd6d29b6` + branch heads; findings carry DISCOVERED/FIXED binding).
3. No stale/duplicate work — **yes** (frontier reconciled; stacked PRs instead of re-cuts).
4. Minimal correct specialist routing — **yes** (the router selected master+experience for this
   review; security rounds earlier routed security; release language kept separate).
5. Product Evolution restraint (no unnecessary 10G+10S) — **yes** (no quota-filling discovery).
6. Experience uses rendered reality where possible — **yes** (fresh preview + e2e; source-only
   claims avoided).
7. Security binds/re-attacks findings — **yes** (v12/v13 rounds: exact-head binding, re-attack).
8. Release distinguishes merge/artifact/deploy/runtime — **yes** (repeatedly stated; DEPLOYED_SHA
   left to the provider read-back).
9. Pre-verdict rebind — **yes** (snapshots before verdicts; this doc rebinds to the current head).
10. Owner output concise/actionable — **yes** (K10 format).

**Verdict:** vNext = operationally deployable for REVIEW-class work (kernel + router + assurance
tools all PASS); promotion boundary respected — the archived 3-prompt pack remains the A/B
baseline and no canonical replacement is claimed from this single run.
