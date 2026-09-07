# Branding Kit 0907 Marketing Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the approved Branding Kit 0907 public identity into the BlueSkyz Labs marketing site using the repository's verified R4d assets and existing C1.1 trust/performance boundaries.

**Architecture:** Centralize Tony Nguyen, Ho Chi Minh City and `https://blueskyzlabs.com` in `SITE`; keep runtime canonical URL environment-driven; build static BlueSkyz-led brand-story surfaces from verified R4d assets; enrich Organization JSON-LD with founder/locality without inventing email/social/legal data. No new runtime dependency or client JavaScript is introduced.

**Tech Stack:** Astro 7, TypeScript 6, Tailwind CSS v4 utilities, Node architecture tests, Playwright/axe, Lighthouse, existing R4d SVG assets.

**Spec:** `docs/superpowers/specs/2026-09-07-branding-kit-0907-marketing-integration-design.md`

## Global Constraints

- BlueSkyz Labs remains the masterbrand/product house; Tony Nguyen is a founder trust signal, not the primary site identity.
- Approved public identity: `Tony Nguyen — Founder & CEO`, `Ho Chi Minh City, Vietnam`, `https://blueskyzlabs.com`.
- `SITE.url` remains `PUBLIC_SITE_URL`-driven; `SITE.publicWebsite` must not replace preview/runtime canonical behavior.
- R4d provenance remains `canonicalMasterbrandPromoted=false`, `IDENTITY_PROTOTYPE_READY`, `DESIGN_FREEZE_CANDIDATE` until a new checksum-verifiable asset package exists.
- No invented email, legal entity, social profile, certification, customer proof, product claim, trademark status or street address.
- No new runtime dependency, external script, analytics/embed or client JavaScript.
- Preserve existing public-truth, CSP/header, accessibility, static-link, client-JS and Lighthouse gates.

---

### Task 1: Lock Branding Kit 0907 identity/truth contract

**Files:**
- Create: `tests/architecture/branding-kit-0907.test.mjs`
- Modify: `src/data/site.ts`

**Interfaces:**
- Consumes: `SITE`, `BRAND_PRINCIPLES`, existing R4d provenance files.
- Produces: `SITE.publicWebsite`, `SITE.founder`, `SITE.location` for all later tasks.

- [ ] **Step 1: Write the failing architecture test**

Create a Node test that reads `src/data/site.ts`, `src/pages/about.astro`, `src/components/sections/AboutBlueSkyz.astro`, `src/components/layout/Footer.astro`, `src/lib/seo.ts` and `public/brand/blueskyz/r4d/brand-manifest.json`. Assert the site source contains centralized fields:

```js
assert.match(site, /publicWebsite:\s*"https:\/\/blueskyzlabs\.com"/);
assert.match(site, /name:\s*"Tony Nguyen"/);
assert.match(site, /role:\s*"Founder & CEO"/);
assert.match(site, /locality:\s*"Ho Chi Minh City"/);
assert.match(site, /country:\s*"Vietnam"/);
```

Assert the R4d manifest still has:

```js
assert.equal(manifest.canonicalMasterbrandPromoted, false);
assert.equal(manifest.status, "IDENTITY_PROTOTYPE_READY");
assert.equal(manifest.designState, "DESIGN_FREEZE_CANDIDATE");
```

- [ ] **Step 2: Verify RED**

Run:

```bash
node --test tests/architecture/branding-kit-0907.test.mjs
```

Expected: FAIL because `SITE.publicWebsite`, `SITE.founder`, and `SITE.location` do not exist.

- [ ] **Step 3: Add centralized public identity fields**

Extend `SITE` exactly:

```ts
publicWebsite: "https://blueskyzlabs.com",
founder: {
  name: "Tony Nguyen",
  role: "Founder & CEO",
},
location: {
  locality: "Ho Chi Minh City",
  country: "Vietnam",
},
```

Do not change `url`, `contactEmail`, or `securityEmail` behavior.

- [ ] **Step 4: Verify targeted GREEN**

Run the new test. Expected: identity/provenance assertions PASS; surface assertions added in later tasks may remain intentionally RED until their implementation.

- [ ] **Step 5: Commit**

Commit as `feat: centralize approved BlueSkyz public identity`.

---

### Task 2: Replace placeholder About copy with verified brand-story composition

**Files:**
- Create: `src/components/sections/BrandStory.astro`
- Modify: `src/pages/about.astro`
- Modify: `tests/architecture/branding-kit-0907.test.mjs`
- Modify: `tests/e2e/trust-routes.spec.ts`

**Interfaces:**
- Consumes: `SITE.founder`, `SITE.location`, `SITE.publicWebsite`, `BRAND_PRINCIPLES`, `/brand/blueskyz/r4d/symbol_material_expression.svg`.
- Produces: reusable static brand-story section used by About.

- [ ] **Step 1: Extend tests before implementation**

Architecture assertions must require:

```js
assert.doesNotMatch(about, /publishes when approved/i);
assert.match(about, /BrandStory/);
assert.match(story, /symbol_material_expression\.svg/);
assert.match(story, /BRAND_PRINCIPLES/);
assert.match(story, /SITE\.founder/);
assert.match(story, /SITE\.location/);
assert.match(story, /SITE\.publicWebsite/);
assert.doesNotMatch(story, /ISO|SOC|bank-grade|military-grade/i);
```

Extend `/about/` Playwright coverage to require visible founder, `Ho Chi Minh City` and `blueskyzlabs.com`.

- [ ] **Step 2: Verify RED**

Run targeted architecture test. Expected: missing `BrandStory.astro`/About integration failures.

- [ ] **Step 3: Implement `BrandStory.astro`**

Use a two-column static section. Left column contains concise brand narrative:

> BlueSkyz Labs is a product house based in Ho Chi Minh City, building intelligent digital products around clarity, trust, and useful impact.

> Founded by Tony Nguyen, BlueSkyz brings product thinking, engineering discipline, and brand craft into one house. We prefer simple systems, evidence-backed decisions, and products that earn trust through how they work.

Render founder role/location/public website from `SITE`, not repeated literals. Right column renders the decorative R4d material-expression symbol with `alt=""`, intrinsic `width="520" height="520"`, followed by the four `BRAND_PRINCIPLES` as semantic list/cards. No status/certification badges.

- [ ] **Step 4: Compose About page**

Keep `<h1>About BlueSkyz</h1>` and a short opening statement, then render `<BrandStory />`. Remove the approval-placeholder paragraph.

- [ ] **Step 5: Run targeted architecture + About e2e**

Expected: new architecture test and `/about/` founder/location/website assertions PASS.

- [ ] **Step 6: Commit**

Commit as `feat: integrate approved BlueSkyz brand story`.

---

### Task 3: Bring founder/location signature into homepage and footer

**Files:**
- Modify: `src/components/sections/AboutBlueSkyz.astro`
- Modify: `src/components/layout/Footer.astro`
- Modify: `tests/architecture/branding-kit-0907.test.mjs`
- Modify: `tests/e2e/home-c1.spec.ts`

**Interfaces:**
- Consumes: centralized `SITE` fields from Task 1.
- Produces: consistent homepage/footer trust signature without duplicating identity literals.

- [ ] **Step 1: Extend architecture assertions**

Require `AboutBlueSkyz.astro` and `Footer.astro` to reference `SITE.founder`, `SITE.location`, and/or `SITE.publicWebsite`. Require an `/about/` deep link from the homepage About section. Reject hard-coded `Tony Nguyen` in those components so `SITE` remains SoT.

- [ ] **Step 2: Verify RED**

Expected: current components hard-code founder and omit approved public website/location.

- [ ] **Step 3: Update homepage About surface**

Show:

- `SITE.founder.name — SITE.founder.role`
- `SITE.location.locality`
- a restrained `Read the BlueSkyz story` link to `/about/`

Keep the homepage BlueSkyz-led and preserve existing section order.

- [ ] **Step 4: Update footer brand signature**

Render a small, readable footer line using centralized fields and an external HTTPS link to `SITE.publicWebsite`. Keep existing nav, tagline, proposition and motto.

- [ ] **Step 5: Verify homepage and footer**

Run architecture test plus existing shell/home Playwright tests. Confirm no mobile navigation or footer regression.

- [ ] **Step 6: Commit**

Commit as `feat: publish centralized founder and location signature`.

---

### Task 4: Enrich Organization structured data without breaking canonical truth

**Files:**
- Modify: `src/lib/seo.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `tests/architecture/seo-contract.test.mjs`
- Modify: `tests/architecture/branding-kit-0907.test.mjs`

**Interfaces:**
- Consumes: `SITE.url`, `SITE.founder`, `SITE.location`.
- Produces: `organizationJsonLd(siteUrl, identity)` with founder/locality metadata while retaining runtime URL.

- [ ] **Step 1: Write failing SEO assertions**

Test the Organization output contains:

```js
assert.deepEqual(org.founder, { "@type": "Person", name: "Tony Nguyen" });
assert.equal(org.address.addressLocality, "Ho Chi Minh City");
assert.equal(org.address.addressCountry, "VN");
assert.equal(org.url, "https://example.com/");
assert.equal("email" in org, false);
assert.equal("sameAs" in org, false);
```

- [ ] **Step 2: Verify RED**

Expected: current helper returns only context/type/name/url.

- [ ] **Step 3: Implement identity parameter**

Use a narrow typed parameter:

```ts
interface OrganizationIdentity {
  founder: { name: string };
  location: { locality: string; countryCode: string };
}
```

Return founder Person + PostalAddress fields. Do not add `publicWebsite` as `url` or `sameAs`; runtime `siteUrl` remains canonical.

- [ ] **Step 4: Wire BaseLayout**

Call `organizationJsonLd(SITE.url, { founder: SITE.founder, location: { locality: SITE.location.locality, countryCode: "VN" } })`.

- [ ] **Step 5: Verify SEO contract**

Run targeted SEO/branding tests. Expected: PASS with runtime URL preserved and no invented fields.

- [ ] **Step 6: Commit**

Commit as `feat: add founder locality to organization schema`.

---

### Task 5: Record provenance/evidence and run full quality gates

**Files:**
- Create: `docs/evidence/2026-09-07-branding-kit-0907-integration.md`
- Modify: `docs/superpowers/plans/2026-09-07-branding-kit-0907-marketing-integration.md` only to mark executed steps after evidence exists.

**Interfaces:**
- Consumes: Tasks 1–4 and remote preview/CI evidence.
- Produces: truthful integration record and PR-ready branch.

- [ ] **Step 1: Add evidence record**

Document:

- branch/base SHA;
- approved identity facts;
- exact R4d assets reused;
- explicit statement that exact 0907 binary package was not re-labelled/promoted;
- changed surfaces;
- test/build/browser evidence;
- residual external domain cutover/email/assets items.

- [ ] **Step 2: Run full source gates**

Run:

```bash
pnpm test:architecture
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm check:client-budget
pnpm check:static-links
```

Expected: all PASS.

- [ ] **Step 3: Run browser quality**

Run Chromium Playwright/axe suite and Lighthouse CI. Expected: no WCAG regression and existing Lighthouse thresholds remain green.

- [ ] **Step 4: Inspect Cloudflare preview**

Require successful preview build on exact branch head; do not treat a previous-head build as evidence.

- [ ] **Step 5: Red-team content and diff**

Search for duplicated founder/location literals, invented email/social/legal/customer/security claims, unverified 0907 provenance promotion, broken external links, oversized runtime images, new client JavaScript and accidental product truth changes.

- [ ] **Step 6: Open PR only after verified head**

Open a focused PR from `brand/branding-kit-0907-integration` to `main`. Do not combine with PR #68; if #68 lands first, rebase/merge-update safely and rerun all gates before promotion.
