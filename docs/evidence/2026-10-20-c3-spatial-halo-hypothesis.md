# C3-G spatial halo: hypothesis and GO/NO-GO metrics, 2026-10-20

**Plan:** `docs/superpowers/plans/2026-09-13-c3-g-spatial-halo-experiment.md`, Task 1.
**Owner decision 2026-10-20:** a small, separately budgeted experiment is approved. NO-GO is a valid outcome.
**Kind:** a plan record written before any prototype code. It is not evidence that the experiment has value.

## User problem

A visitor on the home page or `/products/` should understand what the portfolio is and reach the product they came for.

- Today that is two public products, Sổ Trọ and Sổ Tâm. The other three registry records stay hidden.
- The hypothesis to test is narrow: a restrained spatial arrangement of the real product artifacts may make it easier to tell the two products apart and to remember them, without slowing down the route to a chosen product.

## Prior that favours NO-GO

- With two products there are few relationships to show. A spatial layout earns its cost when there are many items or a real structure between them.
- This prior is stated before testing so a weak result is read as NO-GO, not as a reason to add more effects.

## Comparison metrics

Each metric compares the current Product House (control) with the native 2.5D prototype. A WebGL prototype is compared only if the native one passes.

| Metric                                         | Method                                                           | Evidence class     |
| ---------------------------------------------- | ---------------------------------------------------------------- | ------------------ |
| Product identification and comprehension       | Owner-run E4 or approved evaluation task                         | Human E4           |
| Time to reach a chosen product                 | Same task, timed                                                 | Human E4           |
| Visitor-reported clarity and memorability      | Same session, short questions                                    | Human E4           |
| Client JS delta on the affected route (brotli) | `pnpm budget:client` before and after                            | E3                 |
| Lighthouse and lab LCP/CLS/INP                 | CI Lighthouse on the PR head                                     | E3 (not field CWV) |
| Keyboard, mobile and reduced-motion parity     | Existing Playwright/axe matrix plus targeted specs               | E3                 |
| Maintenance cost                               | New files, new dependencies, test surface, protected-path impact | Review             |

## Proposed thresholds

The Owner may tighten these. The experiment may not loosen them on its own.

| Gate                   | Native 2.5D prototype                                                                           | WebGL prototype (only after native GO and an ADR)                    |
| ---------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Client JS on the route | at most +3 KB brotli                                                                            | at most +40 KB brotli, lazy-loaded, never on the critical path       |
| Site-wide hard budget  | unchanged (120 000 B; current site-wide 17 593 B, worst page 13 227 B per the 2026-10-19 audit) | unchanged                                                            |
| Third-party requests   | 0                                                                                               | 0 (no CDN runtime)                                                   |
| Lab CLS                | 0 added                                                                                         | 0 added                                                              |
| Lab LCP                | no regression above 100 ms on mobile Lighthouse                                                 | same                                                                 |
| No-JS / reduced motion | full content and every product link, no spatial-only navigation                                 | static fallback is the default; WebGL is an enhancement              |
| Accessibility          | axe clean; keyboard order follows reading order                                                 | same, and the canvas is `aria-hidden` with semantic links outside it |
| New dependencies       | none                                                                                            | one, only under a separate ADR (protected path, Owner label)         |

## NO-GO conditions

Any one of these ends the experiment with NO-GO, and the standard Product House stays:

- comprehension or time to a product gets worse in the evaluation;
- mobile layout or reading order is compromised;
- any accessibility parity check fails;
- any budget row above is exceeded;
- the benefit cannot be measured, because no human evaluation is available.

## Dependency on Human E4

- Three of the seven metrics are Human E4, and the Owner deferred Human E4 on 2026-10-20.
- Agent walkthroughs and simulated users are preflight only, so they cannot stand in for these metrics.
- **Consequence:**
  - A native prototype may be built and checked against the E3 rows.
  - GO cannot be issued until an evaluation runs.
  - Until then the most the experiment can reach is "E3 within budget, value NOT VERIFIED".

## Next step

Task 2 of the plan: a native HTML/CSS/SVG prototype behind no new dependency, on one route, measured against the rows above.
