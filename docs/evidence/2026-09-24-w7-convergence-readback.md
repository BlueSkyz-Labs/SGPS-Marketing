# C3-C W7 — Convergence read-back

**Recorded:** 2026-09-24 (Asia/Ho_Chi_Minh, SEAST)
**Plan of record:** `docs/superpowers/plans/2026-09-24-marketing-full-audit-experience-convergence.md`
**Read-back point:** `main` = `f1608a2` (CI run 35980051286: `Quality Gates` success,
`Browser Assurance` still in progress at the moment of writing — recorded as observed, not assumed)
**Last fully green main:** `668ed744` (CI run 35976468617: `Quality Gates` success, `Browser Assurance` success)

W7 requires four things: record **completed / verified / blocked / external** separately; promote only
after the correct branch's **exact-head** controls pass; check the **Cloudflare deployment and real
public routes**; and **not self-certify human acceptance**. This document does exactly that and nothing
more — it is a read-back, not a declaration of a converged experience.

## Method

Every statement below is grounded in one of: `gh run view` / `gh pr list` (CI and PR state at the
recorded SHA), the repository's own architecture suite run at the PR head, an unauthenticated `curl`
against production hosts, or the Cloudflare Workers custom-domain API. Nothing is inferred from a
branch name, a plan's status field, or a previous session's summary.

## COMPLETED and VERIFIED

| Item                                   | Evidence                                                                                                                                                                | Exact head            |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| W0 refresh live truth                  | router + PR state re-read before any work                                                                                                                               | —                     |
| W1 Dossier provenance root fix         | PR **#237** branch work; claim-provenance hardening                                                                                                                     | in flight (see below) |
| W2 converge open C4 PRs                | #244 #243 #241 #238 #236 #233 merged                                                                                                                                    | per-PR head           |
| W3 experience baseline + gap map       | `docs/evidence/2026-09-24-w3-experience-baseline-gap-map.md`                                                                                                            | merged                |
| W5 functionality, locales, SEO         | `docs/evidence/2026-09-24-w5-w6-correctness-hardening.md`; PR **#250** merged                                                                                           | `250` head            |
| W6 security / performance / operations | same evidence record; negative-matrix and leakage scans                                                                                                                 | `250` head            |
| W4 matrix verification                 | CI run 35976468617 on `668ed744`: `Quality Gates` **success**, `Browser Assurance` **success**; local-run invalidity recorded in `2026-09-24-w4-matrix-verification.md` | `668ed744`            |
| Orphan-branch takeover                 | PR **#251** merged; 190 branches triaged, 77 superseded refs removed with a SHA recovery manifest                                                                       | `#251` head           |
| Legacy deployment decommission         | PR **#253**: three `blueskyz-web` hostname bindings removed from the `tonydemo.com` zone; external probe `000`/`522`, canonical host unchanged                          | `#253` head           |
| Reproduction gate for each PR          | `pnpm test:architecture` **519/519** and `fmt`/`lint` clean at every head recorded here                                                                                 | per PR                |

## VERIFIED but pending merge (in flight)

| PR                                                                                                           | Subject                                             | State                             |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | --------------------------------- |
| **#254**                                                                                                     | W4 matrix verification + orphan-prune HEAD incident | open, queued                      |
| **#253**                                                                                                     | tonydemo decommission record                        | open, queued                      |
| **#251**                                                                                                     | orphan-branch takeover manifest                     | **merged**                        |
| **#248**                                                                                                     | issue #240 — canonical claim-source links           | open, queued                      |
| **#245**, **#237**, **#235**, **#234**, **#232**, **#231**, **#230**, **#229**, **#228**, **#225**, **#224** | C4/C3 experience + router + dependabot              | open, each with a live queue lane |

Each of these is promoted only by the repository's own rule: branch → PR → exact-head `Source
Assurance` → merge. Green CI on a _previous_ head is never treated as evidence for a later one, which
is also why `f1608a2` is recorded as "Browser Assurance in progress" rather than promoted here.

## BLOCKED — owner-gated by design (not defects)

| Gate                                            | Why it cannot be closed by an agent                                                                                                                                        |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product truth / authentic screenshots (`c2-p0`) | requires real product captures; fabricating one is forbidden                                                                                                               |
| Real contact + security mailbox facts           | owner facts                                                                                                                                                                |
| Public launch (Cloudflare Access `OFF`)         | the canonical host is currently intercepted by Cloudflare Access on **every** probed route including `/.well-known/sgps.json`; turning it off is an owner release decision |
| C4-F private evaluation room                    | requires dedicated private identity, RBAC, isolation, retention, recovery and threat-model GO                                                                              |
| C4-A Task 10 (Gallery mount)                    | owner-gated                                                                                                                                                                |
| ADR 0011 / C4-G remote briefing, C3-E concierge | require provider, privacy, citation-bound validation, abuse, cost and kill-switch GO                                                                                       |
| Client analytics / RUM                          | no privacy/provider approval recorded                                                                                                                                      |
| Legal, trademark, rights, human E4/E5/E6        | external by definition                                                                                                                                                     |

## EXTERNAL — actions taken or outstanding outside the repository

- **Taken:** the `tonydemo.com` deployment for this project was decommissioned in Cloudflare (three
  hostname bindings removed), verified externally. Scope was deliberately limited to this project's
  bindings because the zone also serves unrelated workers (`cxo-production`, `apexagent-*`,
  `sotro-staging`).
- **Outstanding:** Cloudflare Workers Builds remains the deploy authority — deployment read-back must
  be re-run against the deployed version after each production promotion, independently of green CI.
- **Outstanding:** provider/privacy approval for any future remote-AI or analytics capability.

## What this read-back explicitly does NOT claim

- **No self-certified human acceptance.** E4 real-user customer-task and brand-interpretation evidence
  remains open; automated browser evidence is preflight only.
- **No CONVERGED state.** The plan forbids declaring E4/E5/E6, production RUM, legal rights,
  remote-AI readiness or public launch without their own evidence, and none of those exist yet.
- **No production reachability.** The canonical host answers with Access, so "the site is live" would
  be false; the correct statement is "the deployment exists and is gated".

## Next actionable work (not blocked, not external)

The modernization addendum's M01–M08 items are baseline-gated: each is implemented only where a
measured baseline shows a material gap, in separate reversible PRs. The first measurement pass
(cross-document motion, image/font critical path, `_headers`/cache behaviour on static versus
generated responses, route-derived SEO, frontend link resilience, dependency isolation) is the next
executable wave and requires no owner input to _measure_ — only to _release_.
