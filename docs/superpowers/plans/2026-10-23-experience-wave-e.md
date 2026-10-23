# Experience wave E (2026-10-23)

Owner request 2026-10-23: check the latest state, fix every finding, make the
current customer journey smooth and natural, lift the visual craft to the
project's own standard. Owner delegation: "do what is best for the project,
adopt SGPS FULL".

Baseline: `main@28a9124`. Audit: agent experience audit of 11 routes × 390/1440
× light/dark (axe 0 violations, CLS 0, no overflow), lens = taste-skill and
ui-ux-pro-max as advisory references
(`docs/evidence/2026-10-23-external-design-skills-review.md`). Lead (orchestrator)
re-checked EX-01 and EX-02 on the screenshots before planning.

Authority order: AGENTS.md hard rules > Brand Kit v4 > C2 contract
(`tests/architecture/c2-home-composition.test.mjs`) > this plan > the lenses.
No new copy except strings composed from existing ones; no stock imagery; no
new dependencies; reduced-motion and no-JS contracts hold.

## PRs

| PR   | Scope                                           | Findings                                                                                         | Visual baselines                                 |
| ---- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| E-A  | Sổ Trọ product page (`/{lang}/products/sotro/`) | EX-01, EX-05, EX-06, EX-07, EX-08, EX-22                                                         | sotro pages only                                 |
| E-B  | Home, inner pages and chrome polish             | EX-02/12/16 (lead decision below), EX-13, EX-14, EX-15, EX-17, EX-18, EX-19, EX-20, EX-21, EX-23 | all pages; lands after E-A                       |
| P1-A | Journal post pages, author, RSS, JSON-LD        | (spec 2026-10-22 §13)                                                                            | none                                             |
| P1-B | First Journal posts + Journey label (D-2)       | EX-09                                                                                            | all pages; lands last, needs the Owner's "duyệt" |

Merge order: P1-A → E-A → E-B → P1-B, one at a time, each re-merging `main`
and refreshing its baselines from the CI `visual-gate-diffs` artifact.

## Lead decisions

- **EX-02/EX-12/EX-16 (home duplication):** the C2 contract keeps the compact
  flagship act. Keep the act; give it a distinct job: proof. Its device crop
  shows a legible strip of the real screen at readable scale. The hero keeps
  headline, lead, the flagship row and one primary action; the Sổ Tâm chip leaves
  the hero only if no contract requires it (Sổ Tâm already has its own act).
- **EX-01:** two-column product hero at ≥1024 px using the first story image
  already on the page; secondary button "contact us" with the existing string
  and href; the three small status paragraphs become one compact status block.
- **EX-08:** the brand identity card stays only if a gate or registry contract
  requires it on the page; otherwise it leaves the page tail (asset kept).

## Owner decisions (not started)

| Id   | Decision                                                | Lead recommendation                            |
| ---- | ------------------------------------------------------- | ---------------------------------------------- |
| O-01 | Home first claim: lead with the concrete Sổ Trọ promise | yes; needs 4-locale copy                       |
| O-02 | Publishable company facts for About                     | Owner lists what may be published              |
| O-03 | A real primary action for Sổ Trọ preview                | email "request access" link                    |
| O-04 | Caption that the app UI is Vietnamese on non-vi pages   | yes; needs copy                                |
| O-05 | Header IA: add Verify; header CTA                       | add Verify; keep Products                      |
| O-06 | Opt-in UI sound layer                                   | NO-GO now; revisit with an interactive surface |
| O-07 | Home proof strip from published claims                  | yes, after O-01                                |
