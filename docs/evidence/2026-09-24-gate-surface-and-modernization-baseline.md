# Gate surface and modernization baseline (M01–M08) on main `f1608a2`

**Recorded:** 2026-09-24 (Asia/Ho_Chi_Minh, SEAST)
**Plan of record:** `docs/superpowers/plans/2026-09-24-marketing-full-audit-experience-convergence.md`
(required gates §271–295; modernization addendum M01–M08 §327–523)
**Measured at:** `origin/main` = `f1608a2`, in a clean worktree created from that ref

The plan allows the addendum's M01–M08 items to be implemented **only where a baseline shows a
material gap**, in separate reversible PRs. This record is that baseline: the plan's own gate list run
end-to-end, then each M item measured. Where there is no gap the honest outcome is "retain current
behaviour", which is what most of these are — an audited non-change, not an omission.

## 1. Required source gates, run in order

| Gate                             | Result                   | Notes                                                                                      |
| -------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------ |
| `pnpm test:architecture`         | **PASS** (519/519, 56 s) |                                                                                            |
| `pnpm architecture:views:check`  | **PASS**                 | derived views in sync                                                                      |
| `pnpm typecheck`                 | **PASS** (62 s)          |                                                                                            |
| `pnpm lint`                      | **PASS**                 |                                                                                            |
| `pnpm format:check`              | **PASS**                 |                                                                                            |
| `pnpm build`                     | **PASS** (37 s)          | 5.7 MB `dist/`, 53 HTML files                                                              |
| `pnpm check:client-budget`       | **PASS**                 | site-wide **4059** Brotli bytes, worst page **2854**, ceiling **120000** — 3.4 % of budget |
| `pnpm check:static-links`        | **PASS**                 | `brokenCount: 0`, `externalSkipped: 321`                                                   |
| `pnpm check:publishability`      | **PASS**                 |                                                                                            |
| `pnpm check:integrity-firewall`  | **PASS**                 |                                                                                            |
| `pnpm verify:git-evidence`       | **PASS**                 |                                                                                            |
| `pnpm check:promotion-state`     | **PASS**                 |                                                                                            |
| `pnpm check:deployment-evidence` | **PASS**                 |                                                                                            |
| `pnpm check:product-provenance`  | **PASS**                 |                                                                                            |

Two gates first failed in **2 seconds**, and that is worth recording precisely because a fast failure
is easy to mistake for a product defect: `check:client-budget` aborted with `Missing dist\index.html`
and `check:static-links` with `dist/ missing — run pnpm build first`. Both are **precondition checks on
a build artefact**, and both passed once `pnpm build` had run. A gate run out of order is not a red
gate, and reporting it as one would be false.

Observed environment note (not a failure): pnpm warns the engine wants `node >=24.20.0` while the run
used `v24.17.0`. Recorded so the next reader does not treat it as new.

Source and browser gates for the same main: `Source Assurance` run 35980051286 — `Quality Gates`
**success**; `Browser Assurance` was still in progress when this was written. The last fully green main
is `668ed744` (run 35976468617).

## 2. M01–M08 baseline and verdicts

| Item                                                 | Measured baseline                                                                                                                                                                                                                                                                                                                                                                       | Verdict                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M01** cross-document motion                        | Only **6** `view-transition-name` occurrences, all produced by two single-source-of-truth libraries (`src/lib/product-transition.ts`, `src/lib/route-transition.ts`); `@view-transition` declared in `src/styles/global.css:431`; **23** `prefers-reduced-motion` guards                                                                                                                | **No gap — retain.** Native cross-document transitions are already the mechanism; the plan's own acceptance says keep current behaviour when an opt-in adds nothing.                                                                                                                                                                                |
| **M02** navigation prefetch                          | `astro.config.mjs` contains **no** prefetch and **no** speculative prerender                                                                                                                                                                                                                                                                                                            | **No gap — retain.** The plan authorises the experiment only if measured latency justifies it; no such measurement exists, and its acceptance explicitly keeps plain links when inconclusive.                                                                                                                                                       |
| **M03** image/font critical path                     | `brandAssets.hero` defines png/webp/avif, but the **built HTML contains 0 references** to `website_hero` (Hero renders a 520×520 SVG symbol with `width`/`height`/`decoding`); the three variants are guarded by `brand-kit-v4-fidelity`, `brand-v4-provenance` and `brand-v4-runtime`; `dist/` media = 3.7 MB over 64 files, dominated by the 1.97 MB brand PNG; client JS 4 KB Brotli | **No user-facing gap — retain, with the measurement recorded.** The heavy PNG is brand-kit fidelity evidence that no browser fetches (proved by zero references in built output) and three architecture contracts require it to exist. Deleting it to make a size number look better would break contracts to change nothing a visitor experiences. |
| **M04** deploy-safe cache and recovery               | `public/_headers` sets CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` on `/*`, plus `X-Robots-Tag: noindex` on the stable `workers.dev` host and versioned preview URLs; `check:deployment-evidence` and `check:promotion-state` PASS                                                                                                  | **No gap found in-repo.** Deployed-response verification is limited by the Access gate on the canonical host and remains part of post-promotion read-back.                                                                                                                                                                                          |
| **M05** route-derived SEO / multilingual publication | `src/pages/sitemap.xml.ts` is prerendered and emits per-language routes plus evidence-passport URLs; `src/lib/seo.ts` provides `canonicalForPath` and `hreflangLinks` across all languages                                                                                                                                                                                              | **No gap — implemented and contract-tested.**                                                                                                                                                                                                                                                                                                       |
| **M06** frontend security and link resilience        | No outbound external links in the component surface; where links can be external they set `noopener noreferrer` / `noreferrer`; CSP is declared in `_headers`; `check:integrity-firewall` PASS                                                                                                                                                                                          | **No gap.**                                                                                                                                                                                                                                                                                                                                         |
| **M07** dependency modernization                     | Two dependabot PRs in flight (development-dependencies group; `prettier-plugin-astro`), each with its own isolated CI evidence                                                                                                                                                                                                                                                          | **In flight — not a gap.** Isolated, evidence-gated modernization is exactly the policy.                                                                                                                                                                                                                                                            |
| **M08** accessibility incident                       | `@axe-core/playwright` matrix in `tests/e2e/accessibility.spec.ts` plus dedicated `text-spacing` and `text-zoom` specs; `Browser Assurance` green on the last fully green main                                                                                                                                                                                                          | **No gap.** Already treated as an incident lane rather than a polish backlog.                                                                                                                                                                                                                                                                       |

## 3. What follows from this baseline

- The waves' acceptance gates are green on the tested main, **with numbers**, from the plan's own list —
  not a narrative summary of them.
- No M item justifies a code change on the evidence measured. The one material artefact that looks like
  waste (the 1.97 MB brand PNG) is deliberately retained and contract-protected, and the proof that no
  visitor downloads it is the zero-reference scan of built output.
- Still actionable without owner input: M07 (in-flight dependency PRs) and the post-promotion deployment
  read-back, which must be re-run against the deployed version rather than inherited from CI.
- Still owner-gated: product truth and screenshots, public launch (Access), C4-F, remote-AI providers,
  analytics/RUM privacy, legal and human E4.

## 4. What this record does not claim

It does not claim the addendum is "done": every M item was measured and found already satisfied or
deliberately retained, which is a weaker and truthful statement than "implemented". It does not claim
production reachability (the canonical host answers with an Access login), does not self-certify human
acceptance, and does not declare a converged experience.
