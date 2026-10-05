# SGPS FULL audit and global-standards benchmark — SGPS-Marketing

- **Bound to:** `main@ecc67e7`, and a production-origin build of `main@c173f16`. Only docs changed between the two, and the built `_headers` is byte-identical to `public/_headers`.
- **SGPS:** pin `v1.13.0` (unchanged); sgps-core `91e5c1a` (decisions through 032).
- **Date:** 2026-10-04.
- **Method (GRES FULL):**
  - two read-only lanes: SGPS decision-by-decision applicability, and an external-standards benchmark using sources retrieved on 2026-10-04;
  - orchestrator synthesis and fixes.
- **Reused, not re-measured:**
  - `docs/evidence/2026-10-04-pre-golive-redteam-v11.md` (runtime, edge, content, supply chain);
  - `docs/evidence/2026-10-04-v10-e7-delta-post-e4.md` (axe 178/0, 64 runtime pages, budgets);
  - `docs/evidence/2026-10-04-cloudflare-zone-readback.md`.
- **Verdicts:** PASS / GAP / NOT VERIFIED.
- **Pre-lift state:** the live apex is gated by Cloudflare Access, so live-header checks are NOT VERIFIED until v9 T3.

## 1. SGPS FULL adoption

The decision-by-decision matrix is in `docs/sgps/EFFECTIVE_SGPS_CONTEXT.md`. Changes in this round:

| Item                                                 | Before                                                  | After                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DEC-017 Security-by-Default (LOCK, mandatory)        | GAP: no SBD map                                         | **ADOPTED**: `docs/sgps/adoption/SGPS_DEC_2026_017_SECURITY_BY_DEFAULT.md`. SBD-INV-01..16 map to 13 ENFORCED, 2 NOT_APPLICABLE and 1 OWNER_GATED (INV-09 recovery drill). Guarded by `tests/architecture/sgps-sbd-mapping.test.mjs`, with a negative proof                                       |
| DEC-028 Experience perf & friction (LOCK, mandatory) | PARTIAL: evidence NOT_VERIFIED, go-live BLOCKED         | **ADOPTED (lab-verified)**: exact-head evidence, negative proof and positive proof are bound to `main@ecc67e7` (push run 37184402684, completed/success). `node tools/verify-experience-performance-friction.mjs go-live` → `DEC028_GO_LIVE_PASS`. Field CWV remains owner-gated (`rum-provider`) |
| DEC-002 Effective context                            | PARTIAL: no single index; 029, 030 and 031 unclassified | **ADOPTED**: one index for DEC-001..032                                                                                                                                                                                                                                                           |
| DEC-016, 020, 027, 031                               | No local N/A record                                     | **RECORDED_NA**, each with a reason and a trigger                                                                                                                                                                                                                                                 |
| DEC-029 Platform fit                                 | GAP                                                     | **PARTIAL**: baseline drafted (proposed KEEP, with re-review triggers); the Owner accepts or amends                                                                                                                                                                                               |
| DEC-030 Portable lessons                             | GAP                                                     | **RECORDED**: PL-01, PL-04, PL-07 and PL-08 mapped (all NOT_APPLICABLE, each with its re-check trigger)                                                                                                                                                                                           |
| DEC-019 evidence                                     | Stale: zh-Hant shown as ARCHITECTURE_READY              | Update note: zh-Hant is first-class in source; native review is owner-gated                                                                                                                                                                                                                       |
| DEC-032 mapping, open item 2                         | Stale: JS Detections injected                           | Closed (`enable_js=false`, #479)                                                                                                                                                                                                                                                                  |
| DEC-025 vs DEC-028                                   | The gate step is labelled DEC-025 while DEC-028 governs | Recorded. Renaming the protected workflow step is an Owner-labelled follow-up; the upstream header drift goes to sgps-core                                                                                                                                                                        |

## 2. Global-standards benchmark

| Dimension            | Standard (retrieved 2026-10)                                                                                           | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Security headers     | OWASP HTTP Headers Cheat Sheet [S1]; MDN HTTP Observatory scoring [S2]                                                 | **PASS**. XCTO, XFO DENY, Referrer-Policy, COOP and CORP all match; X-XSS-Protection is absent; CSP is same-origin with Trusted Types and `frame-ancestors 'none'`; HSTS is 1 year with includeSubDomains. Predicted Observatory grade A+ (NOT VERIFIED until the lift). **GAP (LOW):** `interest-cohort` is deprecated in Permissions-Policy [S3]; no CSP `report-to` [S4]; no COEP. All three live in `public/_headers` (protected) and need the Owner |
| security.txt         | RFC 9116 [S6]                                                                                                          | **PASS**: Contact, Expires (343 days out), Canonical and Preferred-Languages. **Fixed in this round:** `Policy:` now points at `/en/security/`, with a test and a negative proof. Live reachability behind Access is NOT VERIFIED; it is resolved at the lift or by an Access bypass for `/.well-known/*` (Owner)                                                                                                                                        |
| SEO                  | Google Search Central: hreflang [S7], Organization structured data [S8], favicon [S9]                                  | **PASS**: hreflang with x-default and script subtags, self-canonical, robots, sitemap (77 URLs), OG/Twitter, favicon set. **GAP (LOW, Owner facts):** Organization has no `description`, `sameAs` or `contactPoint`. Only real profiles may be added                                                                                                                                                                                                     |
| Core Web Vitals      | web.dev [S10]: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 (field p75)                                                        | **PASS (lab budgets aligned or stricter**; CLS budget 0.05). Field INP/CWV is NOT VERIFIED until `rum-provider` is decided                                                                                                                                                                                                                                                                                                                               |
| Accessibility        | WCAG 2.2 Recommendation [S11]; WCAG 3 is a Working Draft [S12]                                                         | **PASS** on automated WCAG 2.2 (178 scans, 0 violations). **GAP (MED):** no accessibility statement page [S13]. The commitment wording is Owner copy. EU EAA scope [S14] likely does not cover this site (an inference, NOT VERIFIED)                                                                                                                                                                                                                    |
| Privacy / legal      | GDPR Art. 13 [S15]; Vietnam PDPL, Law 91/2025/QH15, in force 2026-01-01 [S16]; Cloudflare Workers Logs retention [S17] | **PASS:** no cookies, no trackers. **GAP (HIGH before public launch, Owner/legal):** the privacy notice lacks controller identity and contact, legal basis, retention, rights and complaint route. The page itself says full legal wording awaits approval. **GAP (MED):** it does not name Cloudflare as the hosting/CDN processor or give log retention, while `wrangler.toml` persists invocation logs                                                |
| Internationalization | W3C language declarations [S18]                                                                                        | **PASS**: per-locale `lang` values (`en`, `vi`, `zh-Hans`, `zh-Hant`) and `dir="ltr"`                                                                                                                                                                                                                                                                                                                                                                    |
| Manifest / favicon   | MDN installable PWA [S19]                                                                                              | **PASS**. **INFO:** a duplicate unlinked `/site.webmanifest`, left in place (brand asset path)                                                                                                                                                                                                                                                                                                                                                           |
| Supply chain         | OpenSSF Scorecard checks [S20]                                                                                         | **PASS:** lockfile, pinned package manager, Dependabot, SHA-pinned actions, read-only token, SECURITY.md, CODEOWNERS. **GAP (LOW, Owner):** no CodeQL, Scorecard or SBOM workflow (`.github/` is protected)                                                                                                                                                                                                                                              |

## 3. Owner decisions surfaced by this round (none blocks the Access lift)

1. **HIGH, before public launch:** an approved privacy notice covering controller, purpose and basis, retention, rights and contact. Name Cloudflare and the log retention. This is legal wording; agents do not write it.
2. **MED:** accessibility statement wording, covering the WCAG 2.2 AA target, contact and known limits. An agent can draft it on request.
3. **MED:** `security.txt` reachability. Either lift Access, or add a Bypass for `/.well-known/*`.
4. **MED:** `rum-provider`, the field CWV source.
5. **LOW (protected `public/_headers`):** remove `interest-cohort`; decide on CSP reporting (privacy first) and COEP.
6. **LOW:** Organization `sameAs`, `description` and `contactPoint` (real facts only); CodeQL/Scorecard/SBOM workflows; HSTS preload (deliberate; see the Sổ Trọ runbook).
7. **SBD-INV-09:** a Workers version rollback drill to verify recovery.
8. **Protected follow-ups:** route DEC-017 from `AGENTS.md`; rename the DEC-025 gate label to DEC-028.

## 4. NOT VERIFIED

- All live apex response headers and the Observatory grade (pre-lift).
- Field CWV.
- Googlebot crawlability.
- The Cloudflare plan's log retention (3 or 7 days).
- PDPL SME-exemption applicability.
- EAA scope.
- GitHub secret-scanning and Dependabot-alert settings.
- Ruleset read-back.

## Sources (retrieved 2026-10-04)

- [S1] https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
- [S2] https://raw.githubusercontent.com/mdn/mdn-http-observatory/main/src/grader/charts.js
- [S3] https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy
- [S4] https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/report-to
- [S5] https://hstspreload.org/
- [S6] https://www.rfc-editor.org/rfc/rfc9116.html
- [S7] https://developers.google.com/search/docs/specialty/international/localized-versions
- [S8] https://developers.google.com/search/docs/appearance/structured-data/organization
- [S9] https://developers.google.com/search/docs/appearance/favicon-in-search
- [S10] https://web.dev/articles/vitals
- [S11] https://www.w3.org/TR/WCAG22/
- [S12] https://www.w3.org/TR/wcag-3.0/
- [S13] https://www.w3.org/WAI/planning/statements/
- [S14] European Commission, European Accessibility Act page (commission.europa.eu)
- [S15] https://gdpr-info.eu/art-13-gdpr/
- [S16] https://english.luatvietnam.vn/dan-su/law-on-personal-data-protection-law-no-91-2025-qh15-405135-d1.html
- [S17] https://developers.cloudflare.com/workers/observability/logs/workers-logs/
- [S18] https://www.w3.org/International/questions/qa-html-language-declarations
- [S19] https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- [S20] https://github.com/ossf/scorecard/blob/main/docs/checks.md
