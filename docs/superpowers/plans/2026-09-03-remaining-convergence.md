# Remaining Convergence Plan — Owner-gated & residual gaps

> **For agentic workers:** Execute only items that are still open and safe.
> Do not claim Issue #8 closed without verified GitHub ruleset reads.

**Goal:** Close residual gaps after C1.1 Astro foundation without inventing owner-gated domain, email, legal, product, or R4d facts.

**Canonical SoT:**

- Spec: `docs/superpowers/specs/2026-09-03-blueskyz-web-v1-c1-1-design.md`
- Plan: `docs/superpowers/plans/2026-09-04-blueskyz-web-v1-c1-1-implementation.md`
- ADR 0004: `ASTRO_7` → Cloudflare Workers Static Assets
- ADR 0005: GitHub Source Assurance + Cloudflare deployment dual control
- Hardening plan: `docs/superpowers/plans/2026-09-07-global-elite-hardening-implementation.md`

**Permission evidence:** `docs/evidence/2026-09-04-permission-blockers.md`  
**Hardening evidence:** `docs/evidence/2026-09-07-global-elite-hardening.md`

**Current baseline (2026-09-07 hardening pass):**

| Area                           | Status                                                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| C1.1 technical foundation      | Landed on `main` through the R4d/trust/SEO convergence series                                                               |
| Astro 7 static architecture    | PASS; ADR 0004 remains authoritative                                                                                        |
| Public product registry        | Intentionally empty until proof-backed owner facts exist                                                                    |
| R4d provenance                 | LANDED from approved `sgps-core` source revision; Cursor App grant remains external                                         |
| Cloudflare Workers Builds      | CONNECTED; preview/production deployment authority remains Cloudflare                                                       |
| GitHub Source Assurance        | IMPLEMENTED under ADR 0005; exact-head `Quality Gates` + `Browser Assurance` verified on PR #68                             |
| `main` ruleset                 | **EXTERNAL BLOCKER** — read-back remains `rulesets=[]`; Issue #8 stays OPEN                                                 |
| Supply-chain policy            | REMEDIATED — integrity-pinned pnpm 11.25.0, minimum release age, exotic-subdep blocking, strict build allowlist             |
| Deployment CLI                 | REMEDIATED in repo — Wrangler 4.127.1 is project-local/locked; only required `esbuild` + `workerd` lifecycle builds allowed |
| Temporary domain               | `tonydemo.com` wired as owner-approved temporary site identity                                                              |
| Production emails / truth gate | **EXTERNAL BLOCKER** — contact/security emails remain unset; production truth gate must not be faked                        |
| Field RUM                      | Design recorded; production enablement remains a privacy/owner decision                                                     |

---

### Task 1: Enforce main promotion ruleset (Issue #8)

ADR 0005 supersedes the old blanket avoidance of GitHub Actions. GitHub Actions now owns **secretless source assurance only**; Cloudflare Workers Builds remains deployment authority.

- [x] Create exact-head GitHub source-assurance checks `Quality Gates` and `Browser Assurance`
- [x] Verify both checks succeed on PR #68 candidate heads
- [x] Keep GitHub workflow read-only, secretless, exact-head and deployment-free
- [ ] Create an active branch ruleset on `main` requiring PR + `Quality Gates` + `Browser Assurance`
- [ ] Require branch up-to-date and conversation resolution; block force-push and deletion
- [ ] Verify a direct write to `main` is rejected and a green PR remains mergeable
- [ ] Read back the active ruleset and confirm configured controls match Issue #8
- [ ] Close Issue #8 only after successful enforcement/read-back

**Current constraint:** repository ruleset read-back is still `[]`; the available connector exposes read-back but no ruleset create/update action. Documentation and green CI are not treated as enforcement.

---

### Task 2: Cloudflare Workers Builds wiring

- [x] Connect `BlueSkyz-Labs/SGPS-Marketing` → Worker `blueskyz-web` Builds
- [x] Preview trigger enabled; production-only truth gate omitted while required emails are absent
- [x] Confirm Builds emits successful preview/deployment checks
- [x] Canonical build recipe includes `pnpm build`, `pnpm check:client-budget`, and `pnpm check:static-links`
- [x] Temporary `PUBLIC_SITE_URL=https://tonydemo.com` configured for builds
- [x] Pin repository Wrangler CLI and lock transitive deployment graph
- [ ] **EXTERNAL:** normalize Cloudflare configured deploy commands from `npx wrangler ...` to project-local `pnpm wrangler ...`; current frozen install contains the pinned Wrangler so `npx` resolves locally, but external config should match the repository contract explicitly
- [ ] When production emails exist, add `pnpm validate:public-truth` to the production promotion command

Evidence: `docs/evidence/2026-09-05-workers-builds-connected.md`, `docs/evidence/2026-09-07-global-elite-hardening.md`.

---

### Task 3: Custom domain and production identity

- [x] Temporary owner domain `tonydemo.com`
- [x] Custom domains `tonydemo.com` / `www.tonydemo.com` / `blueskyz.tonydemo.com` → `blueskyz-web`
- [x] Canonical/sitemap behavior verified in prior evidence
- [ ] **EXTERNAL:** owner supplies verified `PUBLIC_CONTACT_EMAIL` + `PUBLIC_SECURITY_EMAIL`
- [ ] Enable and verify production `validate:public-truth` only after those facts exist

---

### Task 4: R4d brand provenance

- [ ] **EXTERNAL:** add private `sgps-core` to Cursor GitHub App selected repositories if future direct Cursor reads are desired
- [x] Approved R4d source imported from `sgps-core` revision `28dbbc7e28442173c367212096e9095b9e09c0d6`
- [x] Production Master Candidate v1.1 applied with provenance/checksums
- [x] Site uses approved lockups/icons/tokens rather than geometric placeholders
- [x] Empty public registry fails honest/soft rather than fabricating products or CTAs

---

### Task 5: Brand photography / About portrait

- [ ] **EXTERNAL:** supply public-safe About visual when approved
- [x] Keep truthful typographic treatment while no approved image exists

---

### Task 6: GTM `/so-tro`

- [x] Historical Next-era PR #33 closed as superseded; do not merge into Astro main
- [ ] If Sổ Trọ marketing remains desired, implement it as evidence-gated C1.1 product content rather than reviving the legacy atelier runtime

---

### Task 7: Public product promotion

- [ ] **EXTERNAL:** obtain owner-confirmed product facts, proof artifacts and trust paths
- [ ] Promote YAML entries with `public: true` only after schema + proof + public-truth gates pass

---

### Task 8: Residual QA / observability

- [x] Privacy-conscious field INP/RUM design recorded
- [x] Visual-baseline lifecycle recorded
- [ ] **JUSTIFIED EXCEPTION:** production RUM remains disabled until collection purpose/provider/retention/privacy treatment is approved; static marketing operation does not require inventing telemetry

---

## Autonomous-safe work already completed

- Astro 7 static C1.1 architecture, product truth/schema, trust routes, SEO/canonical/noindex, security headers/CSP, WCAG/axe browser coverage, client-JS/static-link budgets and Lighthouse promotion checks.
- R4d provenance and production assets; empty-product and empty-email paths remain truthful.
- Cloudflare Workers Static Assets + Builds connected; legacy Pages deployment retired.
- ADR 0005 dual-control Source Assurance added with full-SHA Actions, `contents: read`, exact candidate checkout and no Cloudflare credentials/deploy authority.
- pnpm supply-chain policy moved to active project configuration; package manager integrity pinned; dependency lifecycle builds fail closed.
- Wrangler recovery/deploy CLI pinned locally and covered by architecture contract; `workerd` was allowlisted only after a clean-install failure proved it required a lifecycle build.

## Residual external/manual state

1. GitHub `main` ruleset enforcement — **EXTERNAL VERIFICATION REQUIRED**; Issue #8 remains open.
2. Production contact/security email facts + production truth-gate enablement — **EXTERNAL VERIFICATION REQUIRED**.
3. Cloudflare trigger command normalization to explicit `pnpm wrangler ...` — **EXTERNAL CONFIG UPDATE/VERIFICATION REQUIRED**.
4. Public product facts/proof, photography and optional Cursor `sgps-core` grant — **EXTERNAL/OWNER INPUT REQUIRED**; none may be fabricated.
