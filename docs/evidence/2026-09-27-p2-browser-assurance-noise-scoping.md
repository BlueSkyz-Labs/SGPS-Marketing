# P2 browser-assurance noise scoping — flaky mobile no-JS continuity timeout and the root SEO warning

**Status:** EVIDENCE_RECORD — item 1 resolved (fix landed), item 3 recorded, item 2 partially verified (one browser measurement outstanding)
**Issue:** `BlueSkyz-Labs/SGPS-Marketing#284`
**Evidence of record:** Source Assurance run `36232472011` (PR #282, exact head `cff176de3fc105e7f526f015a8d9898e34bb5eb1`) — concluded SUCCESS with 2,505 PASS / 1 FLAKY / 10 SKIPPED.
**Date:** 2026-09-27

## 1. The flaky test — root cause and deterministic fix (item 1)

- **Symptom.** `tests/e2e/c2-product-continuity.spec.ts` — the standalone no-JS continuity test exceeded the framework's 30 s default once on mobile Chromium, then passed on retry (`retries: CI ? 1 : 0`).
- **Root cause.** That test starts its **own** fixture server inside the test body (`startFixtureServer()`), while every other test in the file shares one server via `beforeAll`/`afterAll`. Under CI contention (`workers: CI ? 2 : "50%"`, `fullyParallel: true`) the cold-start tax — browser launch plus ephemeral HTTP server bring-up — stacks on top of the ordinary navigation budget.
- **Deterministic fix (landed).** PR #295 (`54f7d48`) widens **only this test's own** budget (`test.setTimeout(60_000)`). The global per-test default, the worker count, the retry policy and every assertion are unchanged; `playwright.config.ts` is untouched (the `timeout: 120_000` there is the `webServer` start timeout, not a test budget).
- **Not a product regression.** The fixture is synthetic (`fixture-flagship`); it is unrelated to the Contact/Support source change in #282. A green retry is **not** recorded here as human E4 evidence.

## 2. Lighthouse SEO warning — scoping (item 2)

- **Config of record.** `lighthouserc.json` audits exactly one URL — `http://127.0.0.1:3000/` — with 3 runs on the desktop preset. `categories:seo` is asserted as **warn** (minScore 0.9) and `is-crawlable` is **off**.
- **The audited URL is intentionally non-indexable.** `/` is the bounded DEC-019 language gateway (architecture test: "root is the bounded DEC-019 language gateway, not a locale content duplicate"). A `noindex` root cannot satisfy Lighthouse's crawlability audit by design, so the SEO warning on `/` is **expected behaviour, not a production indexability regression**.
- **Where real indexability is owned.** The indexable surfaces are the locale roots (`/en/`, `/vi/`, `/zh/`) and their localized pages; their indexability is enforced by the robots/sitemap/canonical/hreflang architecture tests (`published locale paths have reciprocal hreflang targets`, `sitemap enumerates canonical localized surfaces and all three evidence locales`, `BaseLayout emits complete locale-safe SEO metadata`, `sitemap.xml.ts gates non-production identity like robots.txt`).
- **Outstanding measurement.** A local Lighthouse desktop run against `/en/` (3 runs, same preset) to record the SEO score on an indexable surface and prove the warning is root-specific. **NOT_YET_VERIFIED** until that measurement is recorded; no config change is proposed before it.

## 3. Skipped tests and retries — inventory (item 3)

Every `test.skip(...)` site in `tests/e2e/` is conditional and carries its reason — none is a silent omission. Three classes:

| Class                      | Sites                                                                                                                                                                                                                                                                                       | Reason                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registry-state exclusivity | `c2-flagship-theatre.spec.ts:196`, `c2-home.spec.ts:86`, `c2-home.spec.ts:107`, `c2-product-continuity.spec.ts:240`, `c3-product-visual.spec.ts:81`, `c3-release-empty-state.spec.ts:7`, `empty-and-404.spec.ts:51`, `products.spec.ts:7`, `products.spec.ts:25`, `source-trace.spec.ts:41` | Each asserts the empty-registry **or** the populated-registry branch. With five public products the opposite branch is skipped — the counterpart test runs. |
| Browser capability         | `evidence-depth.spec.ts:41`, `evidence-passport.spec.ts:129`, `source-trace.spec.ts:91`, `source-trace.spec.ts:115`, `c3-microinteractions.spec.ts:47`                                                                                                                                      | Print probes are chromium-only; the hover probe requires a hover-capable pointer.                                                                           |
| Fixture data               | `c4-decision-to-dossier.spec.ts:76`                                                                                                                                                                                                                                                         | Needs at least two composable claims in the fixture.                                                                                                        |

The **10 SKIPPED** in run `36232472011` are the subset of these whose conditions held on that matrix (registry populated, plus non-chromium browsers for the print/hover probes). The count varies with the browser matrix, never by silent removal. The **1 FLAKY** is the continuity test in §1, retried once per policy.

## 4. Explicit non-claims

- This record does **not** reverse the reported SUCCESS of #282, and does **not** convert the corporate-mailbox `BLOCKED_OWNER_FACT` (#281) into PASS.
- No public owner mailbox, product claim, provider configuration or protected branch was mutated under this P2 investigation.
- §2 stays a config-and-design reading until the `/en/` measurement lands; nothing here is a claim about a deployed SEO score.
