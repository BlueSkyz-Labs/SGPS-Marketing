# W5 + W6 — correctness, locale/SEO audit and hardening evidence

**Recorded:** 2026-09-24 (Asia/Ho_Chi_Minh, SEAST)
**Program:** Marketing — SGPS FULL Audit and Experience Convergence, waves **W5** and **W6**
**Local authority:** `docs/superpowers/plans/2026-09-24-marketing-full-audit-experience-convergence.md`
**Measured at:** `BlueSkyz-Labs/SGPS-Marketing@687aa92` (`origin/main`)
**Method:** run the repository's own commands and enumerate their output. Nothing here is asserted from memory; every claim below names the command that produced it.

## Law for this record

The plan allows two outcomes per item: _"If RED proves the gap, fix the root cause… If not, preserve
counterevidence."_ Several audits below ended in the second branch. A green result recorded with its
command is evidence; a gap that turned out to be deliberate design is recorded as such rather than
"fixed" into a regression.

## W5 — functionality, locale and SEO correctness

### Locale parity (proved by set equality, not by count)

| Check               | Result                                  | Command                                                  |
| ------------------- | --------------------------------------- | -------------------------------------------------------- |
| Route sets en == vi | **true**                                | extract `^/(en\|vi\|zh)` paths from `dist`, compare sets |
| Route sets en == zh | **true**                                | same                                                     |
| Routes per language | **15 / 15 / 15** (53 built pages total) | `find dist -name "*.html"`                               |

### Sitemap, robots, canonical and hreflang

Apparent anomalies were investigated to their source before being called anything:

| Observation                                             | Verdict               | Evidence                                                                                                                                                    |
| ------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dist/sitemap.xml` had **0** `<loc>` entries            | **Correct by design** | `src/pages/sitemap.xml.ts` returns `locs = []` when `isNonProductionSiteUrl(SITE.url)` — a local build without `PUBLIC_SITE_URL` must not publish a sitemap |
| `dist/robots.txt` = `User-agent: *` + **`Disallow: /`** | **Correct by design** | `src/pages/robots.txt.ts` emits `Disallow: /` only for non-production URLs, and `Allow: /` + `Sitemap:` for production                                      |
| Root `/` has no canonical/hreflang/description          | **Correct by design** | built with `<meta name="robots" content="noindex, follow">` and a language-chooser nav — it is a gateway, not a landing page                                |
| `/about/` has meta-refresh + canonical to `/en/about/`  | **Correct by design** | Astro redirect stub, `noindex`, canonical to the canonical locale                                                                                           |
| Locale pages emit **4** hreflang alternates             | **Expected**          | `en`, `vi`, `zh-Hans`, `x-default`                                                                                                                          |

No SEO defect was found in this slice; counterevidence preserved rather than a "fix" manufactured.

### Actionable correctness

Selection handoff, empty states, resets, navigation and sources are covered by the existing e2e
surfaces, each re-run on the exact head that carried it: `c4-dossier-composer` + `c4-dossier-print`
**19/19 × 2 browsers** on the dossier branch head (`42c7fbb`), including
`/zh/dossier/ keeps every published source reachable without JavaScript`, and `language-switching`
**8/8 × 2 browsers** on `fix/i18n-locale-segment-boundary-rebased-20260924` before it merged to main
(#243). At this record's head the equivalent authority is `pnpm test:architecture` **519/519**.

## W6 — security, performance and operational hardening

### Required source gates actually executed at this head

| Command                                | Result                                     |
| -------------------------------------- | ------------------------------------------ |
| `pnpm run build`                       | **0** (53 pages, static export verified)   |
| `pnpm run typecheck`                   | **0**                                      |
| `pnpm run lint`                        | **0**                                      |
| `pnpm exec prettier --check <touched>` | **0**                                      |
| `pnpm test:architecture`               | **0** — **519/519**, 0 fail                |
| `pnpm run check:client-budget`         | **0**                                      |
| `pnpm run check:static-links`          | **0**                                      |
| `pnpm run check:publishability`        | **0**                                      |
| `pnpm run check:integrity-firewall`    | **0**                                      |
| `pnpm run check:promotion-state`       | **0**                                      |
| `pnpm run check:product-provenance`    | **0**                                      |
| `pnpm run check:deployment-evidence`   | **0**                                      |
| `pnpm run verify:git-evidence`         | **0**                                      |
| `pnpm run architecture:views:check`    | **0**                                      |
| `pnpm audit --audit-level=moderate`    | **0** — _"No known vulnerabilities found"_ |

### Built-output leakage scan

Scanned **195 files** under `dist` for: localhost origins, Windows absolute paths, credential-shaped
assignments, `TODO/FIXME/HACK`, `sourceMappingURL`, private-key blocks, and internal `src/**` paths.

| Pattern                           | Hits   | Verdict                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Credential-shaped assignment      | **0**  | clean                                                                                                                                                                                                                                                                                                                                                                          |
| Private key block                 | **0**  | clean                                                                                                                                                                                                                                                                                                                                                                          |
| Windows absolute path             | **0**  | clean                                                                                                                                                                                                                                                                                                                                                                          |
| `sourceMappingURL`                | **0**  | clean                                                                                                                                                                                                                                                                                                                                                                          |
| Internal `src/**` file references | **0**  | clean                                                                                                                                                                                                                                                                                                                                                                          |
| `TODO/FIXME/HACK`                 | **0**  | clean                                                                                                                                                                                                                                                                                                                                                                          |
| `http://localhost…`               | **52** | **build artifact, not a leak** — `SITE.url = PUBLIC_SITE_URL \|\| localFallback`; this build ran without the variable. Production config is guarded independently: `deploy-contract` asserts `PUBLIC_SITE_URL must be https`, `public-truth-gate` asserts the exact canonical origin `blueskyzlabs.com`, and `lighthouse-command` asserts the launcher sets `PUBLIC_SITE_URL`. |

### Negative fixtures added this session

| Fixture                                                                                                                           | Baseline                       | After fix                     |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------------- |
| Self-only chain refused in **EN/VI/zh** with canonical surface id unchanged (#239)                                                | **4 of 6 red**                 | 6/6 green; lens suite 14/14   |
| Briefing must not compose a refused claim, and must report it (`missing` / `not-public`)                                          | added                          | green                         |
| Dossier claim `href` must equal its canonical provenance route (#240)                                                             | **1 red** (href always `null`) | green; dossier contract 10/10 |
| Locale sibling, query/fragment normalization, external & unsafe destinations, missing-route fail-closed, independent-source break | all new                        | green                         |

### Disabled-by-default capabilities (verified still off)

No RUM/analytics transmission, no remote model call, no private runtime: held by
`check:promotion-state`, `check:integrity-firewall`, `c4-briefing-contract` (no network/model/storage/
random/clock primitive), and ADR **0011** recording model synthesis as **NO-GO** pending owner approval.

## What this record does **not** claim

Visual convergence or polish (W4), human acceptance, E4/E5/E6 recognition, product activation,
public reachability (production is Cloudflare-Access gated by owner decision), legal/trademark
clearance, or any owner-gated GO. Those remain `PENDING_EXTERNAL` per
`docs/evidence/2026-09-24-w3-experience-baseline-gap-map.md`.
