# Remaining Convergence Plan — Owner-gated & residual gaps

> **Active residual execution contract.** Execute only items that remain open, safe and evidence-backed. Newer accepted ADRs and provider controls supersede older implementation-status wording. Historical promotion work remains in evidence/plan history and is not a current blocker.

**Goal:** Close remaining Product Truth, owner/privacy and human-experience evidence gaps after the Astro 7 / Cloudflare Workers foundation without inventing email, legal, product, proof, photography or user-research facts.

## Canonical source of truth

- Experience spec: `docs/superpowers/specs/2026-09-03-blueskyz-web-v1-c1-1-design.md` — substantive design remains authoritative; pre-implementation status text is historical.
- Historical implementation plan: `docs/superpowers/plans/2026-09-04-blueskyz-web-v1-c1-1-implementation.md`.
- ADR 0004: `ASTRO_7` → Cloudflare Workers Static Assets.
- ADR 0005: GitHub Source Assurance + Cloudflare deployment dual control. Historical pre-ruleset wording is superseded by provider read-back.
- ADR 0006: canonical organizational origin `https://blueskyzlabs.com`; `tonydemo.com` is retired/transition history, not valid production identity.
- ADR 0007: SGPS-native canonical architecture model at `architecture/sgps-model.json`; all views are derived.
- Historical hardening execution: `docs/superpowers/plans/2026-09-07-global-elite-hardening-implementation.md`.
- Hardening evidence: `docs/evidence/2026-09-07-global-elite-hardening.md`.
- Latest post-merge assurance / E4 truth audit: `docs/evidence/2026-09-09-pr79-post-merge-and-e4-human-gap.md`.

## Current verified baseline

| Area                               | Current state                                                                                                                                                              |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Astro 7 static architecture        | VERIFIED; ADR 0004 remains authoritative                                                                                                                                   |
| SGPS:Experience                    | FULL design contract adopted; automated/runtime/browser gates exist; human C1.1 acceptance remains OPEN until required real-user evidence exists                           |
| SGPS:Architecture                  | Canonical model + deterministic derived views are required by ADR 0007 and architecture contracts                                                                          |
| Canonical organizational identity  | `https://blueskyzlabs.com` per ADR 0006; retired `tonydemo.com` hosts must fail production truth validation                                                                |
| Public product registry            | Intentionally empty until proof-backed owner facts exist                                                                                                                   |
| Brand provenance                   | Approved BlueSkyz Production Brand Kit v4 assets/tokens are landed with provenance evidence                                                                                |
| Cloudflare Workers Builds          | VERIFIED deployment authority; GitHub Actions remains source-assurance only                                                                                                |
| GitHub Source Assurance            | VERIFIED exact-head `Quality Gates` + protected full cross-browser `Browser Assurance`                                                                                     |
| PR #79 post-merge baseline         | VERIFIED on `3737c726af1cffc2d9018096d7dc57b03cf6d127`: Quality Gates + Chromium/Firefox/WebKit/mobile Playwright/axe + Lighthouse + Workers Build PASS                    |
| Human E4 comprehension/trust       | **OPEN — EXTERNAL / HUMAN EVIDENCE REQUIRED**; authoritative C1.1 requires real-user customer-task + brand-interpretation evidence; 2026-09-04 evidence is agent-only      |
| `main` governance                  | ENFORCED by active ruleset `main-promotion-governance` (`22500299`)                                                                                                        |
| Supply chain                       | Fail-closed pnpm 11.25.0 policy, lifecycle allowlist, Moderate+ dependency audit and pinned tooling                                                                        |
| Deployment CLI                     | Project-local `wrangler@4.127.1`; provider commands use project-local Wrangler                                                                                             |
| Worker public routing              | `workers_dev = false`, `preview_urls = false`; custom-domain path remains canonical                                                                                        |
| Worker observability               | Persisted invocation logs enabled; query strings redacted by architecture contract                                                                                         |
| Production contact/security emails | **EXTERNAL / OWNER INPUT REQUIRED**; public-truth gate must not be faked                                                                                                   |
| Field RUM                          | Design exists; production enablement remains an explicit privacy/owner decision                                                                                            |

Canonical source build recipe includes frozen install, dependency audit, `pnpm test:architecture`, `pnpm build`, `pnpm check:client-budget`, and `pnpm check:static-links`. Browser Assurance adds the repository Playwright/axe matrix across Chromium, Firefox, WebKit/Safari-class and mobile Chromium, followed by Lighthouse. These automated gates do not substitute for the real-user E4 evidence class.

---

## Residual task graph

### Task 1 — Production contact/security truth

State: **EXTERNAL / OWNER INPUT REQUIRED**

- [ ] Owner supplies verified `PUBLIC_CONTACT_EMAIL`.
- [ ] Owner supplies verified `PUBLIC_SECURITY_EMAIL`.
- [ ] After both facts exist, add `pnpm validate:public-truth` to the production promotion command/config.
- [ ] Verify the production truth gate and resulting public contact/security paths without placeholders.

**Safety invariant:** missing facts remain missing; no invented address may be used to obtain a green build. Canonical site identity itself is no longer owner-unknown: ADR 0006 fixes it at `https://blueskyzlabs.com`.

### Task 2 — Public product promotion

State: **EXTERNAL / OWNER INPUT REQUIRED**

- [ ] Obtain owner-confirmed product facts, lifecycle state, proof artifacts and trust paths.
- [ ] Promote entries with `public: true` only after schema, proof and public-truth gates pass.

**Safety invariant:** the empty public registry is a truthful state, not a defect to bypass.

### Task 3 — Public-safe photography / About visual

State: **EXTERNAL / OWNER INPUT REQUIRED**

- [ ] Supply an approved public-safe About visual if/when desired.
- [x] Until then, retain the truthful typographic treatment rather than fabricate photography.

### Task 4 — Optional direct private SGPS source access

State: **EXTERNAL / OPTIONAL**

- [ ] Add private `sgps-core` to the Cursor GitHub App selected repositories only if future direct Cursor reads are desired.
- [x] Existing approved brand source was already imported from immutable `sgps-core` provenance; current runtime does not depend on live Cursor access.

### Task 5 — Production RUM

State: **JUSTIFIED PRIVACY EXCEPTION / OWNER DECISION**

- [x] Privacy-conscious field INP/RUM design is recorded.
- [x] Visual-baseline lifecycle is recorded.
- [ ] Enable production RUM only after collection purpose, provider, retention and privacy treatment are explicitly approved.

**Rationale:** this static marketing product does not require invented telemetry to be operationally valid; privacy minimization outranks analytics convenience.

### Task 6 — Optional GTM `/so-tro`

State: **FUTURE / PRODUCT-DIRECTION DEPENDENT**

- [x] Historical Next-era PR #33 is superseded and must not be revived into Astro `main`.
- [ ] If Sổ Trọ marketing is still desired, implement it as new evidence-gated Astro C1.1 product content under a separate approved product scope.

### Task 7 — Human E4 customer-task & brand validation

State: **EXTERNAL / HUMAN EVIDENCE REQUIRED**

- [ ] Run the C1.1 discovery/trust task flow with representative **real users**; agent/LLM simulation is preparation only and cannot satisfy this item.
- [ ] Cover the seven customer tasks represented by the existing C1.1 validation flow, preserving truthful N/A outcomes where product facts remain intentionally absent.
- [ ] Test brand interpretation for comprehension, coherence, recognition and skepticism/credibility.
- [ ] Include an explicit credibility probe asking participants to identify anything that feels exaggerated, fake, unclear or untrustworthy.
- [ ] Record anonymized study evidence, findings and severity without inventing participants, quotes, rates or sentiment.
- [ ] Remediate any P0/P1 comprehension or credibility defects through the normal branch/PR/source-assurance flow and revalidate with real users.
- [ ] Close human E4 only when a real-user evidence artifact exists and acceptance is evidence-backed.

**Evidence boundary:** `docs/evidence/2026-09-04-e4-web-validation.md` contains an agent walkthrough and agent visual red team. It is valid preflight evidence but is not real-user acceptance. See `docs/evidence/2026-09-09-pr79-post-merge-and-e4-human-gap.md` for the reconciled determination.

**Operational interpretation:** this open human-evidence item does not turn already-green deterministic runtime/build assurance into failure; it means the authoritative C1.1 **experience acceptance** remains open.

---

## Autonomous controls already verified

- Astro static architecture, product-truth/schema, trust routes, canonical/noindex behavior, CSP/security headers, JSON-LD escaping and proof provenance.
- Protected cross-browser Playwright/axe coverage, Lighthouse, client-JS budget, static-link validation and dependency vulnerability audit.
- GitHub Source Assurance is read-only, secretless, exact-head and full-SHA pinned.
- Active `main` ruleset requires PR, strict `Quality Gates` + `Browser Assurance`, conversation resolution, and blocks non-fast-forward/deletion with no bypass actors.
- Cloudflare preview/production trigger commands are normalized to project-local pinned Wrangler and verified through provider builds.
- Worker `workers.dev` and preview routes are disabled; observability configuration is persisted in `wrangler.toml` and protected by architecture tests.
- Package-manager supply-chain policy and dependency lifecycle scripts fail closed.
- Public product and missing-email paths fail honestly instead of fabricating content/CTAs.
- SGPS architecture model integrity and derived-view freshness are automated contracts; `DIAGRAM ≠ ARCHITECTURE TRUTH`.
- Automated/browser assurance is explicitly separated from human E4 acceptance; no agent walkthrough may be reported as real-user evidence.

## Residual external/manual state

1. Production contact/security email facts + production public-truth promotion gate — **EXTERNAL / OWNER INPUT REQUIRED**.
2. Public product facts/proof and optional photography — **EXTERNAL / OWNER INPUT REQUIRED**.
3. Human E4 real-user customer-task + brand-interpretation study — **EXTERNAL / HUMAN EVIDENCE REQUIRED**.
4. Optional Cursor `sgps-core` repository grant — **EXTERNAL / OPTIONAL**, not a runtime blocker.
5. Production RUM — **JUSTIFIED PRIVACY EXCEPTION / OWNER DECISION** until purpose/provider/retention/privacy treatment exists.
6. Optional `/so-tro` GTM scope — **FUTURE / PRODUCT-DIRECTION DEPENDENT**.

Resolved provider/governance/domain decisions must not be reported as outstanding without new contrary evidence. Unknown or stale provider/runtime state is not PASS and must be re-read before future promotion work. Human acceptance must likewise remain OPEN/UNKNOWN until a real-user evidence artifact exists.