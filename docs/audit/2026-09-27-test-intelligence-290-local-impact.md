# Local Impact Baseline — Issue #290 (SGPS Test Intelligence, EXPANSION)

**Measured at:** 2026-09-28 (SE Asia Standard Time, UTC+07:00)  
**Exact HEAD SHA:** `462aa460243d9dd07976306c962db0a26d49328a` (tracked `origin/main`)  
**Worktree:** `.worktrees/ti290` on branch `research/test-intelligence-290`  
**PR #302 (`claude/marketing-project-audit-623e4t`) test delta:** unreconciled at this SHA — dispositions valid only at measured SHA.

## 1. Baseline

**Measurement commands** (run inside worktree after `pnpm install --frozen-lockfile`):

```bash
git rev-parse HEAD
ls tests/architecture/*.test.mjs | wc -l
ls tests/e2e/*.spec.ts | wc -l
find scripts -type f -name "*.test.*" -o -name "*.spec.*"
node --test tests/architecture/*.test.mjs
grep -E "^\s*(test|it)\s*\(" tests/e2e/*.spec.ts | wc -l
```

**Counts observed:**

| Lane                                           | Test files | Test cases                           | Pass/fail observed                    |
| ---------------------------------------------- | ---------- | ------------------------------------ | ------------------------------------- |
| Architecture (`tests/architecture/*.test.mjs`) | 119        | 653                                  | PASS (653 pass, 0 fail)               |
| E2E (`tests/e2e/*.spec.ts`)                    | 81         | 420 (counted via grep; not executed) | NOT MEASURED — browsers not installed |
| Script self-tests                              | 0          | 0                                    | none found                            |

**Pass/fail state:** Architecture suite fully green (653 pass, 0 fail — count corrected by the coordinator after re-running the suite on the measured SHA; the first draft carried 648). E2E suite not executed (missing Playwright browser runtime). No script self-tests exist.

## 2. Local adaptation table

| Marketing surface                                   | Classification | Existing owner test/CI lane                                                                                       | Disposition                                                                                                                                                                                                                       |
| --------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Marketing claim provenance                          | MANDATORY      | architecture: brand-provenance, c4-provenance-lens, product-provenance, integrity-truth-contract, deploy-contract | Retain; no new canonical standard (upstream skill not merged)                                                                                                                                                                     |
| Consent/opt-in                                      | MANDATORY      | architecture: privacy-preference-truth.test.mjs                                                                   | Retain                                                                                                                                                                                                                            |
| Safe forms                                          | MANDATORY      | architecture: contact-intake-separation.test.mjs, customer-copy-hygiene.test.mjs, security-surface.test.mjs       | Retain; consider adding explicit form-validation tests                                                                                                                                                                            |
| i18n/SEO/canonical routes                           | MANDATORY      | architecture: i18n-contract.test.mjs, hreflang-contract.test.mjs, seo-contract.test.mjs, static-links.test.mjs    | Retain                                                                                                                                                                                                                            |
| Accessibility/responsive/browser                    | RECOMMENDED    | architecture: customer-copy-hygiene.test.mjs (WCAG AA muted token), motion-reduce-contract.test.mjs               | Retain; e2e browser runtime NOT MEASURED                                                                                                                                                                                          |
| Outbound contact                                    | MANDATORY      | architecture: contact-intake-separation.test.mjs, support-intake-separation.test.mjs                              | Retain                                                                                                                                                                                                                            |
| Conversion attribution (where actually implemented) | RECOMMENDED    | none — gap identified                                                                                             | Add architecture test for `src/lib/analytics.ts` (sanitize/emit); observable contract: invalid name/properties rejected; credible regression: untested analytics could leak data or emit invalid events; RED/GREEN proposed below |

## 3. R/F/C/D ledger

**Summary:** 119 architecture test files — 119 R, 0 F, 0 C, 0 D. E2E ledger NOT MEASURED. No deletions proposed.

| Test file                                                  | Classification | Keeper justification                                                                |
| ---------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------- |
| tests/architecture/act-path.test.mjs                       | R              | empty registry primary prefers Contact only when email exists                       |
| tests/architecture/astro-toolchain.test.mjs                | R              | Astro static foundation replaces the Next runtime                                   |
| tests/architecture/bilingual-shared-components.test.mjs    | R              | shared product components never emit bare /products/ paths                          |
| tests/architecture/brand-assets.test.mjs                   | R              | brand asset generator projects C1.1 primitives only                                 |
| tests/architecture/brand-kit-v4-fidelity.test.mjs          | R              | every published v4 asset is byte-identical to the kit master                        |
| tests/architecture/brand-provenance.test.mjs               | R              | Production v4 source kit preserves release provenance                               |
| tests/architecture/brand-token-contract.test.mjs           | R              | brand palette tokens exist and match the kit                                        |
| tests/architecture/brand-v4-experience.test.mjs            | R              | v4 hero uses the supplied website artwork and flat lockup                           |
| tests/architecture/brand-v4-provenance.test.mjs            | R              | v4 source kit keeps production standards and version metadata                       |
| tests/architecture/brand-v4-runtime.test.mjs               | R              | runtime publishes the v4 web asset projection                                       |
| tests/architecture/breadcrumb-contract.test.mjs            | R              | home pages carry no breadcrumb                                                      |
| tests/architecture/builds-recipe.test.mjs                  | R              | SoT production Builds recipes include static-links gate                             |
| tests/architecture/bundle-budget.test.mjs                  | R              | client budget sums Brotli bytes of local scripts referenced by dist/index.html      |
| tests/architecture/c1-tokens.test.mjs                      | R              | C1.1 tokens use R4d primitives without legacy gold                                  |
| tests/architecture/c2-home-composition.test.mjs            | R              | both locales render the six acts in the approved order                              |
| tests/architecture/c2-performance-contract.test.mjs        | R              | dependency inventory declares no banned runtime framework                           |
| tests/architecture/c2-truth-boundary.test.mjs              | R              | C2 surfaces consume truth and author no product/claim/evidence fact                 |
| tests/architecture/c3-agent-passport.test.mjs              | R              | the document carries only the vetted top-level shape                                |
| tests/architecture/c3-craft-contract.test.mjs              | R              | C3 craft has one focused stylesheet imported by the runtime layout entry            |
| tests/architecture/c3-evidence-peek-contract.test.mjs      | R              | Evidence Peek uses canonical capability proof                                       |
| tests/architecture/c3-experience-fidelity.test.mjs         | R              | reduced motion forces static-premium tier                                           |
| tests/architecture/c3-experience-intent.test.mjs           | R              | publishes every declared explicit intent                                            |
| tests/architecture/c3-fixture-style-fidelity.test.mjs      | R              | product-present fixture pages load the runtime style entry in authoritative order   |
| tests/architecture/c3-header-scene-contract.test.mjs       | R              | the scene vocabulary has exactly one source                                         |
| tests/architecture/c3-product-proof.test.mjs               | R              | resolvable proof requires explicit capability binding                               |
| tests/architecture/c3-program-boundary.test.mjs            | R              | C3 Trust Continuum consumes the canonical Claim Fabric                              |
| tests/architecture/c3-release-schema.test.mjs              | R              | accepts a release story with a public product, source, and evidence                 |
| tests/architecture/c3-route-transition-contract.test.mjs   | R              | the global sheet declares the navigation transition once                            |
| tests/architecture/c3-truth-choreography.test.mjs          | R              | choreography uses existing text-bearing truth states                                |
| tests/architecture/c4-boardroom-contract.test.mjs          | R              | every presentation selector the script queries exists in the markup                 |
| tests/architecture/c4-briefing-contract.test.mjs           | R              | an empty selection produces no sections and invents nothing                         |
| tests/architecture/c4-colophon-contract.test.mjs           | R              | C4 colophon: no forbidden public leakage                                            |
| tests/architecture/c4-craft-story-contract.test.mjs        | R              | C4-B craft story: a source-backed draft is valid and renderable                     |
| tests/architecture/c4-craft-story-data.test.mjs            | R              | C4-B craft story data: every authored story passes the contract                     |
| tests/architecture/c4-decision-atelier-contract.test.mjs   | R              | the atelier reuses the Decision Room model instead of a second registry             |
| tests/architecture/c4-decision-handoff.test.mjs            | R              | an empty selection has no destination at all                                        |
| tests/architecture/c4-density-budget.test.mjs              | R              | C4 density: a quiet scene passes                                                    |
| tests/architecture/c4-dossier-composer-guard.test.mjs      | R              | the composer module exists                                                          |
| tests/architecture/c4-dossier-contract.test.mjs            | R              | a fully published selection compiles every requested section                        |
| tests/architecture/c4-dossier-provenance.test.mjs          | R              | every dossier source block projects the provenance adapter for the same subject     |
| tests/architecture/c4-editions-contract.test.mjs           | R              | C4-B editions: resolves a real public evidence reference                            |
| tests/architecture/c4-editions-data.test.mjs               | R              | C4-B editions data: every authored edition is publicly resolvable                   |
| tests/architecture/c4-editions-routes.test.mjs             | R              | C4-B edition routes: every language ships an index and a story route                |
| tests/architecture/c4-icon-grammar.test.mjs                | R              | C4 icons: the set stays a bounded allowlist                                         |
| tests/architecture/c4-maison-contract.test.mjs             | R              | C4-B maison: serves the live house sections in order                                |
| tests/architecture/c4-material-grammar.test.mjs            | R              | C4 materials: all four declared exactly once                                        |
| tests/architecture/c4-motion-scarcity.test.mjs             | R              | C4 motion: no perpetual decorative animation                                        |
| tests/architecture/c4-provenance-lens.test.mjs             | R              | the canonical sources really carry what this lens filters                           |
| tests/architecture/c4-public-architecture.test.mjs         | R              | the leak scanner is non-vacuous: the raw model really carries internals             |
| tests/architecture/c4-public-destination-boundary.test.mjs | R              | public destinations reject unsafe URLs                                              |
| tests/architecture/c4-quiet-authority-contract.test.mjs    | R              | C4 quiet authority: exactly one stylesheet                                          |
| tests/architecture/c4-typography-contract.test.mjs         | R              | C4 typography: no second font family                                                |
| tests/architecture/claim-fabric-contract.test.mjs          | R              | claim ids are unique, complete, and localized                                       |
| tests/architecture/cloudflare-workers.test.mjs             | R              | Workers serves the Astro static build                                               |
| tests/architecture/contact-intake-separation.test.mjs      | R              | mutated security fallback fails                                                     |
| tests/architecture/current-work-router.test.mjs            | R              | router declares its schema and authorities that exist                               |
| tests/architecture/customer-copy-hygiene.test.mjs          | R              | customer-facing pages ban internal path and env jargon                              |
| tests/architecture/decision-room-contract.test.mjs         | R              | no storage, cookies, or persistence anywhere                                        |
| tests/architecture/dependabot.test.mjs                     | R              | Dependabot keeps GitHub Actions and pnpm dependencies current with bounded PR noise |
| tests/architecture/deploy-contract.test.mjs                | R              | public-truth validation runs before build and deploy                                |
| tests/architecture/deployment-evidence.test.mjs            | R              | the newest post-merge ledger resolves as the default and passes                     |
| tests/architecture/deploy-toolchain.test.mjs               | R              | Workers deployment uses a project-local locked Wrangler                             |
| tests/architecture/eslint-tooling.test.mjs                 | R              | lint tooling uses zero-warning ESLint with Astro flat config                        |
| tests/architecture/evidence-freshness.test.mjs             | R              | review dates are authored data, never generated                                     |
| tests/architecture/experience-density.test.mjs             | R              | homepage section CTA density stays within the measured ceiling                      |
| tests/architecture/framework-decision.test.mjs             | R              | framework decision is measured and executable                                       |
| tests/architecture/git-evidence.test.mjs                   | R              | (a) HEAD and a real path at HEAD verify PASS                                        |
| tests/architecture/hreflang-contract.test.mjs              | R              | hreflangLinks returns en, vi and zh for every path                                  |
| tests/architecture/https-url.test.mjs                      | R              | isHttpsUrl accepts only https absolute URLs                                         |
| tests/architecture/i18n-contract.test.mjs                  | R              | getLanguageFromPath defaults to en and resolves every locale                        |
| tests/architecture/integrity-evidence-topology.test.mjs    | R              | no entry cites only its own surface page as evidence                                |
| tests/architecture/integrity-firewall.test.mjs             | R              | the real repository passes all ten drift classes                                    |
| tests/architecture/integrity-truth-contract.test.mjs       | R              | integrity modules exist                                                             |
| tests/architecture/lighthouse-command.test.mjs             | R              | Lighthouse uses a cross-platform repository launcher                                |
| tests/architecture/local-gates.test.mjs                    | R              | repository installs a versioned pre-commit gate instead of silently missing Husky   |
| tests/architecture/motion-reduce-contract.test.mjs         | R              | a reduced-motion block neutralises transitions and animations                       |
| tests/architecture/node-runtime.test.mjs                   | R              | repository pins the supported Node LTS runtime for Astro builds                     |
| tests/architecture/operations-contract.test.mjs            | R              | the operations contract exists and QA_STRATEGY points at it                         |
| tests/architecture/playwright-bootstrap.test.mjs           | R              | Playwright browser install is an explicit package script                            |
| tests/architecture/post-merge-landing-guard.test.mjs       | R              | (a) a commit on origin/main passes the guard                                        |
| tests/architecture/post-merge-workflow-wiring.test.mjs     | R              | post-merge workflow is wired to the closed PR event                                 |
| tests/architecture/preview-command.test.mjs                | R              | local preview uses a persistent cross-platform launcher                             |
| tests/architecture/privacy-preference-truth.test.mjs       | R              | privacy truth discloses opt-in preference storage                                   |
| tests/architecture/product-continuity.test.mjs             | R              | naming convention has exactly one source in src/lib/product-transition.ts           |
| tests/architecture/product-empty-branch.test.mjs           | R              | an empty registry reports zero published products                                   |
| tests/architecture/product-profiles.test.mjs               | R              | product profile route is statically wired for public entries                        |
| tests/architecture/product-proof-contract.test.mjs         | R              | product proof media is a local sized artifact contract                              |
| tests/architecture/product-provenance.test.mjs             | R              | the real registry satisfies provenance honestly                                     |
| tests/architecture/product-route-contract.test.mjs         | R              | the locale product index routes exist for every locale                              |
| tests/architecture/product-schema-behavior.test.mjs        | R              | isPublicClaimHttpsUrl rejects preview and documentation hosts                       |
| tests/architecture/product-screenshot-floor.test.mjs       | R              | proof media is currently optional (C1c decision open)                               |
| tests/architecture/product-truth.test.mjs                  | R              | product truth models lifecycle, availability, proof and CTA                         |
| tests/architecture/promotion-state.test.mjs                | R              | real repository yields no FAIL in any assurance stage                               |
| tests/architecture/public-assurance-language.test.mjs      | R              | no public copy claims assurance the surfaces cannot support                         |
| tests/architecture/public-state-semantics.test.mjs         | R              | live vocabularies parse to the expected shape                                       |
| tests/architecture/public-truth-gate.test.mjs              | R              | public truth gate rejects missing production identity                               |
| tests/architecture/publishability-contract.test.mjs        | R              | the valid empty-registry state passes                                               |
| tests/architecture/qrcode.test.mjs                         | R              | generateQRMatrix produces valid square matrix with finder patterns                  |
| tests/architecture/redirect-contract.test.mjs              | R              | the redirect table is non-empty and all destinations are localized                  |
| tests/architecture/scripts-documented.test.mjs             | R              | every assurance script in package.json is documented                                |
| tests/architecture/security-headers.test.mjs               | R              | static responses carry a safe baseline header set                                   |
| tests/architecture/security-policy.test.mjs                | R              | SECURITY.md routes reports through GitHub private vulnerability reporting           |
| tests/architecture/security-surface.test.mjs               | R              | security.txt declares the required RFC 9116 fields                                  |
| tests/architecture/seo-contract.test.mjs                   | R              | published locale paths have reciprocal hreflang targets                             |
| tests/architecture/sgps-architecture-model.test.mjs        | R              | SGPS architecture model is canonical, typed, and graph-valid                        |
| tests/architecture/sgps-experience-adoption.test.mjs       | R              | SGPS Experience adoption evidence keeps governance and convergence separate         |
| tests/architecture/sgps-manifest-contract.test.mjs         | R              | manifest claim ids equal the public Claim Fabric ids                                |
| tests/architecture/s-plus-analytics-contract.test.mjs      | R              | analytics taxonomy is exactly the approved event set                                |
| tests/architecture/s-plus-experience-contract.test.mjs     | R              | S+ purpose-based motion tokens are defined                                          |
| tests/architecture/s-plus-truth-contract.test.mjs          | R              | trust ledger uses only truthful states and evidence kinds                           |
| tests/architecture/static-links.test.mjs                   | R              | static link checker script exists and is wired                                      |
| tests/architecture/supply-chain-policy.test.mjs            | R              | pnpm supply-chain policy is explicit and fail closed                                |
| tests/architecture/support-intake-separation.test.mjs      | R              | never invent an unverified mailbox in any locale                                    |
| tests/architecture/theme-contract.test.mjs                 | R              | dark theme overrides every light-specific surface/text token                        |
| tests/architecture/tooling-vulnerabilities.test.mjs        | R              | tooling graph excludes known traversal and resource-exhaustion advisories           |
| tests/architecture/trust-surfaces.test.mjs                 | R              | support empty state offers contact and security recourse                            |
| tests/architecture/truth-state-contract.test.mjs           | R              | truth-state component exists                                                        |
| tests/architecture/ui-inventory.test.mjs                   | R              | runtime inventory has no Next/atelier residual dependencies or phrases              |
| tests/architecture/vietqr-contract.test.mjs                | R              | TLV helper formats tag, 2-digit zero-padded length, and value                       |
| tests/e2e/*.spec.ts                                        | NOT MEASURED   | E2E suite not executed (browsers missing) — no keeper assigned                      |

**In-flight delta (not a disposition):** open PR #302 deletes `tests/architecture/vietqr-contract.test.mjs` and `tests/architecture/qrcode.test.mjs` and adds keepers (`no-payment-authority`, `product-i18n-contract`, `shell-material`, `theme-blind-surface`, plus `post-merge-landing-guard` changes). Those two R rows are valid **at this SHA only**; their disposition after #302 lands is a fresh decision on the post-#302 tree.

**Gap proposal — conversion attribution test (not implemented):**

- Observable contract: `sanitizeAnalyticsEvent` rejects unknown event names and properties outside `ALLOWED_PROPERTIES`; `emitAnalyticsEvent` dispatches `blueskyz:telemetry` CustomEvent and deduplicates within 1s window.
- Credible regression: untested analytics module could emit invalid events, leak properties, or bypass dedupe, causing data pollution or privacy leakage.
- Proposed RED: inject invalid event name → returns null, no dispatch; valid event → dispatches CustomEvent with correct detail.
- Proposed GREEN: after adding test, invalid inputs still rejected, valid events dispatched.
- Needs no test-only production seam (module already exports pure functions).

## 4. Honest limits

- Provider gates (external services, paid-contract integrations) — NOT VERIFIED.
- Mobile/browser runtime (e2e Playwright) — NOT VERIFIED (browsers not installed in this environment).
- Human E4 (expert accessibility review) — NOT VERIFIED.
- PR #302 test delta — unreconciled at measured SHA; dispositions do not apply to post-#302 tree.
- Canonical SGPS skill/overlay not merged upstream — no ADOPTED claim made.

**CÒN LÀM TIẾP ĐƯỢC: CÓ** — e2e measurement, conversion attribution test addition, and any further surface gaps after reconciling #302.

## 5. No fabricated numbers

Every count above comes from a command executed in this session. Where a count was unavailable (e2e pass/fail, script self-tests), `NOT MEASURED` is written instead.
