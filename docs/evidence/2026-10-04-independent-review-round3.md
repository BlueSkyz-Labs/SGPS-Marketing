# Independent review round 3 — C3-E wave + latest merges (2026-10-04)

Three independent read-only reviews were dispatched in parallel (security,
experience coherence, §3E go-live readiness), each bound to the live
repository state and required to produce execution evidence. This record
keeps the outcome, including what was **refuted** — a review finding is not
true until reproduced.

## 1. Security delta review (verdict: NO MATERIAL DEFECT)

Scope: the C3-E concierge surface + the shell/product/trust merges
(#495/#496/#498). Evidence class: INDEPENDENTLY_VERIFIED.

- No injection sink in the four new files (no `set:html`/`innerHTML`/`eval`/
  `document.write`); the corpus fields render through Astro interpolation.
- Hostile-payload falsification executed in real Chromium: a payload authored
  into a claim statement stayed inert text inside `data-search`; 0 live
  `img`/`script`/`onerror` nodes, 0 dialogs, 0 non-`file://` requests.
- Rendered-HTML leakage: exactly 7 same-origin lang-scoped links per locale;
  zero unpublished slugs, internal paths or secret shapes; the dist leak gate
  was proven non-vacuous (planted `ApexAgent` → build fails).
- Client JS: one 951-byte external module; `/verify/` goes 6121 → 6657
  Brotli bytes; `inlineScripts: []` (CSP-safe bundling held).
- Invariants re-verified on main: 692/692 architecture guards; zero payment
  markers; zero tracking providers; no remote images; protected-path list
  byte-identical; smoke CSP expectations derived from `public/_headers`.
- Two governance observations were investigated and **closed as non-issues**:
  (a) #501 merged into its stacked base branch — by design; #499 is the
  carrier into `main`; (b) the side branch's old base predated #491 and the
  diff direction suggested missing header assertions — the branch **tip**
  carries main's exact hardened content (`git diff origin/main <tip>` on the
  three files is empty).

## 2. Experience coherence review (verdict: 4 defects, all fixed)

Evidence class: INDEPENDENTLY_VERIFIED then remediated in-wave.

| Finding                                                                           | Verdict                 | Resolution                                                        |
| --------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------- |
| F1 — `.concierge__link` 40px < the repo's own 44px floor that gates `/en/verify/` | CONFIRMED (CI-breaking) | `min-height` → 2.75rem                                            |
| F3 — route records rendered raw paths as visible titles                           | CONFIRMED               | localized labels from the canonical nav source + pinning test     |
| F9 gap — print kept the interactive input; forced-colors left to UA defaults      | CONFIRMED               | print rule + forced-colors rule                                   |
| F4 partial — aria-label-only section (no heading)                                 | CONFIRMED               | visible H2 (existing label, no new copy)                          |
| F4 root — "empty H2/H3 sequence in VerifyCentre"                                  | **REFUTED**             | direct parse of the built page: all 10 headings named; no action  |
| F2 — six duplicated localized string blocks; concierge missing the evidence kind  | CONFIRMED               | shared `src/lib/navigator-labels.ts` + drift-guard test (this PR) |

## 3. §3E go-live readiness review (verdict: NOT_READY, 1 owner gate + 1 fix)

Evidence class: INDEPENDENTLY_VERIFIED (every mechanism executed).

- All §3E mechanisms exist and were exercised: production-origin build
  (98 pages, static export verified), smoke suite run end-to-end against an
  emulated Workers-Assets origin (33 PASS / 3 FAIL, all three proven
  `--site`-origin artifacts), 1208/1208 guards, client budget, static links
  (6519 links, 0 broken), publishability, ledger exact-SHA binding
  fail-closed across a 6-case matrix, rollback checker verdicts.
- **Fixed in PR #503:** the certification command as written forwarded a
  literal `--` and failed mechanically (`FAIL arguments — unknown option --`,
  reproduced before/after); four execution traps recorded (ledger naming,
  provider-read-back SHA, `--site` constraint, rollback floor).
- **Remaining owner gates:** lift Cloudflare Access (O-1); optional
  `/.well-known/*` bypass decision; `PUBLIC_CONTACT_EMAIL` /
  `PUBLIC_SECURITY_EMAIL` owner facts (issue #281).
- Not verifiable behind Access: live apex behavior, served SHA mapping,
  Workers Builds `PUBLIC_SITE_URL` value, field CWV.

## Post-review resolution — the owner fold (2026-10-05, #499)

The Owner decided (recorded in the merge branch): **no second navigation
surface on /verify/**. The deterministic corpus now widens the existing
Command Navigator's search text (each product's and surface's verbatim
canonical text joins the item's `data-search`; no item, link or visible copy
is added; a record without a matching item is dropped, never invented).
`ProductConcierge`, its client module and its CSS are removed.

Consequences for the findings above, stated honestly:

- F1 (44px), F3 (raw-path titles), F9 gap (print/forced-colors) and
  F4-part (heading) were fixed in-wave on the surface that the fold then
  removed — **superseded by the fold**, not re-verified as live behavior.
- F2's rationale (two surfaces drifting) dissolved with the second surface;
  the shared-module refactor was dropped rather than landed as a
  single-consumer module.
- The fold itself was independently reviewed here before this record:
  search-text-only widening, fail-safe record-to-item matching, complete
  removals, and the updated e2e spec (product found by published
  description; surface found by its claims; no separate surface rendered).

## Follow-ups recorded (not blocking)

- `src/data/claims.ts` zh/zh-hant `titleLabel` absent for one claim → the zh
  record title falls back to the full statement (pre-existing fail-safe
  fallback; authoring zh copy requires the copy source).
- `ROUTE_SURFACES` includes `support` with no claim declaring that surface
  (dead config; harmless).
- The stylesheet-scoped reduced-motion contract does not cover route-local
  `<style>` animations (no such animation exists today).
