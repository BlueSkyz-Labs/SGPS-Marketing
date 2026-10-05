# v13: Experience — Global Enterprise (SGPS-Marketing)

**Status:** **CONVERGED_WITH_RESIDUALS (2026-10-05).** W1 and W2 landed; W3 and W4 are recorded NO-GO; W5 is BLOCKED_OWNER_FACT. Evidence: `docs/evidence/2026-10-05-v13-convergence.md`.

**Date:** 2026-10-05 (GMT+7).

**Baseline:** `main@fd8776f` (v12 converged).

## Approval

The Owner directed this round on 2026-10-05: "thực hiện tiếp đợt nâng cấp toàn diện theo xu hướng công nghệ mới nhất, global enterprise standard, adopt với tinh thần SGPS: Experience".

**The delegation covers** routine reversible work inside this plan.

**It does not cover:**

- the `owner-approved` label;
- product facts, screenshots or legal prose the repository does not hold;
- lifting Cloudflare Access;
- the RUM provider;
- Human E4.

**Relationship to other plans:**

- v9 §8, v10 §7 and v12 §5 apply unchanged.
- `SGPS-DEC-2026-037` (no flags; one-icon theme) lands through #512, #513 and sgps-core #280.

## 1. Research basis (GRES QUICK, read 2026-10-05)

| Source                                                                                                       | What we take                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [web.dev: Interop 2026](https://web.dev/blog/interop-2026) (2026-02-12)                                      | Anchor positioning, dialogs and popovers (`popover="hint"`, `dialog closedby`), scroll-driven animations, view transitions, `contrast-color()` and scroll snap are the cross-browser focus. The site already ships the first four. |
| [anim.hr: Core Web Vitals in 2026](https://anim.hr/en/blog/core-web-vitals-2026)                             | Ranking uses field data (the 28-day CrUX report); Lighthouse is for debugging. The INP target is 200 ms.                                                                                                                           |
| [PageCrawl: EAA compliance](https://pagecrawl.io/blog/european-accessibility-act-compliance-monitoring-wcag) | The EAA has applied since 2025-06-28, and 2026 enforcement moves to inspections. It draws on WCAG 2.2 and EN 301 549.                                                                                                              |
| [ecorpit: Does llms.txt help SEO?](https://ecorpit.com/does-llms-txt-help-seo-google-2026/)                  | Google Search does not use llms.txt, so it is **not** adopted. Structured data stays the machine-readable layer.                                                                                                                   |

**The main weakness of this basis:** these are E0 desk sources. Field Core Web Vitals and real-user accessibility need production access (Cloudflare Access) and Human E4.

## 2. Measured baseline (`main@fd8776f`, 2026-10-05)

**axe sweep:**

- Scope: a crawl of 80 routes × {1440 light, 1440 dark, 390 light}.
- Rule sets: wcag2a … wcag22aa plus best-practice.
- Result: **zero violations at any impact.**
- axe still marks two checks as _incomplete_ (manual review): colour contrast over gradients, and video captions.

**Criteria axe cannot see:**

| Criterion                        | Result                                                                                   |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| WCAG 2.4.11 (focus not obscured) | Passed                                                                                   |
| WCAG 1.4.10 (reflow at 320 px)   | **Failed** on `/zh/decision-room/` and `/zh-hant/decision-room/` (scrollWidth 437 / 453) |
| WCAG 1.4.12 (text spacing)       | **Failed** on the same two routes                                                        |

**Root cause of the failures:** `word-break: keep-all` on CJK h1–h3 forbids breaks between Han characters.

**CI gap:** `accessibility.spec.ts` asserts only critical/serious violations on 28 fixed routes in light mode.

## 3. Workstreams

| ID     | Workstream                                                                                                                                                                                                                                           | Protected?       |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **W1** | Land #512, #513 and sgps-core #280. Propagate `SGPS-DEC-2026-037` to Sổ Trọ, which is not in this session's repository scope.                                                                                                                        | Labels           |
| **W2** | **WCAG 2.2 AA lock-in** (§4)                                                                                                                                                                                                                         | Yes (CJK guard)  |
| **W3** | **Platform enhancement** with Interop 2026 features, only where it removes JS or measurably improves UX. Candidates: `popover="hint"` for the theme tooltip; `<dialog closedby>` for the command palette. Every change needs a fallback and a guard. | Depends          |
| **W4** | **Performance:** bring product-route LCP back to the pre-v12 level by loading Feature Story chapters 2–5 nearer to view (v12 record: +16 to +81 ms).                                                                                                 | Visual baselines |
| **W5** | **Sổ Tâm story:** a Feature Story for Sổ Tâm. `BLOCKED_OWNER_FACT`: no Sổ Tâm screens exist in `src/content/showcases/`.                                                                                                                             | —                |

## 4. W2 card: WCAG 2.2 AA lock-in

**Fix:** CJK h1–h3 use `word-break: normal` with `auto-phrase` as progressive enhancement, and keep `line-break: strict`. This matches the existing `display-type.css` rule.

**Guards:**

- `tests/architecture/v8-w6-design-system.test.mjs` replaces the old `keep-all` pin with `cjkHeadingProblems`.
- Negative proofs: `keep-all`, `break-all` and a dropped `line-break: strict` each fail.

**Sweep:** `tests/e2e/a11y-wcag22-sweep.spec.ts`, chromium project only.

- The crawl must reach ≥ 60 routes.
- axe: zero violations at any impact in the three configurations.
- 2.4.11: no focused element is painted over by the sticky header. The check uses `elementFromPoint` after the focus animations settle.
- 1.4.10 and 1.4.12: no horizontal scroll and no clipped visible text at 320 px, with and without the WCAG text-spacing overrides.
- A negative-proof test builds a broken fixture for each check and shows it turns red.

**Done when:**

- CI is green on the exact head.
- The sweep passes on main after merge.

## 5. Owner steps after v13

- Lift Cloudflare Access, so field Core Web Vitals can exist.
- Choose the RUM provider.
- Human E4.
- Native zh review.
- #488 legal facts, including an accessibility statement if the EU market is targeted.
- Supply Sổ Tâm screens for W5.
