# Experience wave G — quiet-luxury touchpoints (2026-10-24)

Owner request 2026-10-24 (paraphrased from Vietnamese): the settled content must be
lifted to a refined, top-tier finish at every visual and experiential touchpoint;
named examples: the Journey ("Hành trình") surfaces and the date/time touchpoints
("đồng hồ" — read as every visible date/dateline until the Owner says otherwise).
Owner delegation: "kiểm tra và plan nâng cấp, điều phối harness xử lí luôn".

Baseline: stacked on `claude/marketing-project-audit-623e4t-wave-f` @ `2aa8a7f`
(PR #674, green, awaiting Owner merge). After #674 merges, each lane merges `main`.

Audit (lead, screenshots `scratchpad/shots/g/`, /vi/journal/ + one post, 390 and
1440, light and dark):

- G-01 Journey index is a bare list: cobalt underlined titles, grey `text-sm`
  dates, no lead treatment, no hairline rhythm, no folio cadence. Reads as a
  default blog archive, not an edition page.
- G-02 Journey post: meta line is a sentence fragment row; sources render as raw
  URLs with no publisher label; author card is a generic avatar block; body
  typography uses ad-hoc rem values instead of the C4 role tokens.
- G-03 Dates are rendered through at least three different paths: `formatDate`
  (journal, footer), raw ISO string interpolated into prose (`ProductShowcase`,
  `ProductGuide`, `FlagshipCapture` caption `data-capture-date`), and component-
  local `<time>` markup (Dossier*, Evidence*, SourcesLine, EditionStory,
  AboutComposition). Weight, numerals and tone differ per surface.

Authority order: AGENTS.md hard rules > Brand Kit v4 tokens > C4 spec
(`docs/superpowers/specs/2026-09-16-c4-quiet-authority-digital-maison-design.md`)

> C2 contract tests > this plan. Quiet luxury = confidence through omission:
> no new palette, no gold, no glass, no scroll hijack, no particles, no fake
> telemetry, no new font, no new motion grammar, no new dependency, no new copy
> except strings composed from existing ones or derived from data (a hostname is
> data, not copy). Static/no-JS, reduced-motion, forced-colors, 320 px and 200 %
> zoom must hold. EN/VI parity; zh/zh-hant keep their current empty state.

## Lanes

| Lane | Branch                                          | Scope                                             | Visual baselines                                              |
| ---- | ----------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| G1   | `claude/marketing-project-audit-623e4t-wave-g1` | Journey index + post editorial craft (G-01, G-02) | none (journal routes are not in the visual spec)              |
| G2   | `claude/marketing-project-audit-623e4t-wave-g2` | one `Dateline` role for every visible date (G-03) | all routes; lead refreshes from CI first-attempt actuals only |

Merge order: G1 → G2 (G2 touches `JournalIndex`/`JournalPost` datelines last, after G1).

## G1 — lead decisions

- **Index:** keep the DOM contract (`[data-journal-branch]`, `[data-journal-item]`,
  `[data-journal-empty]`, `[data-journal-language-note]`, `<time datetime>` per
  item). Newest post over the whole index becomes the lead item
  (`data-journal-lead`): title at `--c4-type-section`, description in
  `--c4-reading-measure`. Every other item is a hairline-separated row
  (`border-top: 1px solid var(--c4-hairline)`, `padding-block: var(--space-6)`):
  eyebrow line "branch label · dateline" in `--c4-type-meta` with
  `font-variant-numeric: tabular-nums`, title in `--text-primary` (no cobalt, no
  resting underline; underline on hover/focus-visible with offset), description in
  `--text-secondary`. Branch headings stay as `h2` but take the C4 eyebrow voice
  (small, tracked, cobalt hairline before) instead of `text-2xl`.
- **Post:** meta becomes a quiet folio line under the header: `<dl>` or a single
  `<p>` with `tabular-nums` numerals, hairline above and below, published /
  updated / byline separated by the existing `·`. Sources: each item shows the
  publisher hostname (derived via `new URL(href).hostname`, `www.` stripped) as the
  visible lead label in `--text-primary`, with the full URL still visible beneath in
  the meta tone — `tests/e2e/wf-journal-post-measure.spec.ts` and
  `tests/architecture/journey-p1a-post-pages.test.mjs` pin the full URL, keep them
  passing without weakening. Author card: hairline, 48 px avatar, name in
  `--text-primary`, role in meta tone, bio in reading measure. Body typography
  maps to `--c4-type-*` tokens. Back/RSS row: hairline above, meta tone.
- Tests: extend `tests/e2e/v11-journal-index.spec.ts` or add
  `tests/e2e/wg-journal-craft.spec.ts` (lead item exists exactly once, every item
  title is not `--action-primary` at rest, hostname label present per source, 390
  px no horizontal overflow, axe clean). Add an architecture test with a negative
  proof (a fixture that reintroduces the cobalt resting underline on index titles
  must FAIL the guard).

## G2 — lead decisions

- New `src/components/shared/Dateline.astro`: props `{ iso: string; lang: Language;
label?: string; class?: string }`. Renders `<time datetime={iso}>` with
  `formatDate(lang, iso)`, class `dateline` → `font-variant-numeric: tabular-nums;
font-size: var(--c4-type-meta); color: var(--text-secondary); letter-spacing:
0.01em`. Optional `label` (an existing string passed by the caller) renders before
  the time inside the same element. Non-ISO input falls through unchanged
  (`display-date.ts` already guarantees this). No clock, no client script.
- Migrate every visible date to `Dateline`: `Footer` lastUpdated, `FlagshipCapture`
  caption (keep `data-capture-date` ISO attribute; the visible caption gains the
  localized capture date after the existing label, joined by the existing `·`),
  `ProductShowcase` / `ProductGuide` disclosures (replace the raw ISO inside the
  sentence with `formatDate` output; sentences otherwise unchanged), `SourcesLine`,
  `Evidence*`, `Dossier*`, `EditionStory`, `AboutComposition`, `JournalIndex`,
  `JournalPost`, `pages/index.astro`. Where a `<time>` renders only a year, leave
  it. Keep every `data-*` attribute and test id.
- Guard: `tests/architecture/wg-dateline-single-role.test.mjs` — scans
  `src/**/*.astro` and fails when a `<time` element appears outside
  `Dateline.astro` (allow-list only the year-only case with a comment token
  `dateline-exempt: year`), and fails when `toISOString().slice(0, 10)` is
  interpolated into visible text. Negative proof: a fixture `.astro` string that
  reintroduces a raw `<time>` must FAIL the guard.
- Unit test for `Dateline` rendering across en/vi/zh/zh-hant (Astro container API
  or the project's existing component test path), including non-ISO fallthrough.

## Both lanes — execution contract

- Worktrees: G1 `scratchpad/wt/g1`, G2 `scratchpad/wt/g2`. Env: `PATH=
$S/node-v24.20.0-linux-x64/bin:/opt/node22/bin:$PATH`, `PLAYWRIGHT_BROWSERS_PATH=
$S/pwb`; Playwright and `git commit` run under `flock $S/port3000.lock`.
- Gates before push: `pnpm typecheck`, `pnpm lint`, `pnpm format:check` (or the
  repo's equivalents from `package.json`), `pnpm build`, `pnpm architecture:*`
  tests, the touched e2e specs on chromium, axe on the touched routes. Never
  `--no-verify`, never amend a pushed commit, never raise `maxDiffPixelRatio`,
  never touch `tests/visual/*-snapshots`.
- Commit trailer: `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` /
  `Claude-Session: https://claude.ai/code/session_01SCqxvNgLgL6f3GWTLYLZNu`. No
  model names anywhere inside the repository tree.
- Push with `git push -u origin <branch>`; do NOT open the PR — the lead opens it
  as a draft and runs the reviewer red-team.
- Report: files changed, tests added (with the negative-proof command and its
  FAIL output), gate results verbatim, anything NOT VERIFIED, and every place the
  implementer was tempted to add copy and did not.
