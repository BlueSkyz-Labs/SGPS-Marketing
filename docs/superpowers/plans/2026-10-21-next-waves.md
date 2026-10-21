# Next waves after the 2026-10-20 experience audit (2026-10-21)

Status: ACTIVE successor plan. It decomposes already-approved work and recorded
residuals; it adds no product scope. Baseline: main `edf79f7` (#654). Read
`AGENTS.md`, `CLAUDE.md` and `.claude/OPERATING_RULES.md` (once #659 lands)
first. Refresh live `main`, open PRs and `docs/current-work.json` before acting;
a SHA here is a handoff baseline, not permission to skip newer truth.

## 0. Hand-off state (2026-10-21, 10:30 AM GMT+7)

| PR   | Scope                                    | State at hand-off                                                                |
| ---- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| #652 | ACQ-07 About single CTA rule             | MERGED `39be0ae`                                                                 |
| #653 | RUM beacon contract                      | MERGED `e7edff2`                                                                 |
| #654 | ACQ-09 Products current cue              | MERGED `edf79f7`                                                                 |
| #655 | TRU-10 glosses, en-verify baselines      | labelled; CI on main-merged head; merge chain running                            |
| #659 | Shard split, port guard, OPERATING_RULES | labelled; ready; queued after #655                                               |
| #645 | BB-03, P2-6 guard, TRU-13                | labelled; ready; queued after #659; shares en-verify/vi-products-sotro baselines |
| #656 | G6 availability line                     | labelled; queued last; shares vi-products-sotro baselines                        |

The merge chain lands them one at a time at 8/8 on the exact head with
`behind_by == 0`, merging `main` in when behind and stopping on any conflict or
red check. **First step for the next agent:** read live PR state. For any PR
still open, finish it by the same rule. If the visual gate fails after a `main`
merge, take the replacement PNGs only from that run's `visual-gate-diffs`
artifact (`*-actual.png`, not `retry`), inspect the diff, commit, push once.

## 1. Waves (in order)

### W1. Close the audit wave (agent, unprotected docs)

- After all six PRs land: mark `experience-audit-wave-2026-10-20` MERGED in
  `docs/current-work.json` with the merge SHAs, update the routing section of
  `docs/evidence/2026-10-20-experience-audit-owner-decisions.md`, and do a
  production read-back of the changed pages (About CTA band, Products nav
  underline, Verify glosses, product availability line, profile lockup gone)
  on `https://blueskyzlabs.com` in en/vi.
- Done when: the record PR is merged at 8/8 and the read-back is recorded.

### W2. Measure the shard split (agent; DEC-034 R5)

- After #659 lands, compare the next 10 `Quality Gates` runs with the baseline
  in `.claude/OPERATING_RULES.md` O2 (median 39 min; webkit 33 min).
- Keep the split only if the critical path drops; otherwise revert it in a
  protected PR (needs the Owner label). Record numbers in the PR.

### W3. Visual baseline full refresh (agent; protected `tests/visual/`)

- Residual since #637: committed baselines lack the header Contact link and
  pass only under `maxDiffPixelRatio` 0.001.
- Run the visual gate in CI with an intentional refresh, take every
  `*-actual.png` from the artifact, inspect each diff, commit once.
- Never raise the ratio. Needs the Owner label.

### W4. C3-G Spatial halo prototype (agent; draft PR only)

- Owner decision 2026-10-20: native HTML/CSS prototype as a **draft PR, not
  shipped**; WebGL only after an ADR. Hypothesis:
  `docs/evidence/2026-10-20-c3-spatial-halo-hypothesis.md`.
- Must meet static/no-JS and reduced-motion contracts and the client budget;
  NO-GO is a valid outcome. Do not merge.

### W5. Test-intelligence ledger (agent; issue #290)

- One AUDIT ledger (R/F/C/D) for the `/support` + Contact boundary per
  `docs/sgps/adoption/SGPS_TEST_INTELLIGENCE.md`. Never weaken a guard.

### W6. Repository hygiene (agent)

- Remove merged local worktrees and merged remote `claude/*` branches whose PRs
  are closed (look before deleting; never delete an open PR's branch).

## 2. Owner-gated (do not start without the Owner)

| Item                                 | Needed from the Owner                                                     |
| ------------------------------------ | ------------------------------------------------------------------------- |
| TRU-12 privacy as security source    | a second independent source, or a rule that a self-only chain is accepted |
| P2-6 display tier                    | move inner H1s to `--size-9`, or close as is                              |
| Merge queue (OPERATING_RULES O2)     | ruleset change + approve `merge_group` triggers                           |
| #523 / #522 mailbox proof, M365 rows | receive/reply round trip for `tony@`, `support@`; tenant evidence         |
| #566 served revision                 | `wrangler deployments list` or dashboard read-back                        |
| #451 field CWV / #653 `pageloadId`   | confirm Web Analytics injection; a second beacon observation              |
| #638 signed APK landing              | signed artifact, SHA-256, cert fingerprint, host, public GO               |
| Human E4, native zh/zh-Hant, BB-02   | Owner-executed                                                            |

## 3. Rules that apply to every wave

- Branch → PR → exact-head 8/8 → squash merge at the pinned SHA, one at a time.
- Never add/remove/ask to bypass `owner-approved`; never auto-merge a protected PR.
- No invented copy, claims, screenshots or facts; Owner-approved strings only.
- Local runs: port 3000 free (`reuseExistingServer: false` after #659).
- Report to the Owner in Vietnamese, times in GMT+7 12-hour.
