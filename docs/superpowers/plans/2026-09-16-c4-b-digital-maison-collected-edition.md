# C4-B — Digital Maison & Collected Edition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Organize BlueSkyz as one coherent technology house and publish curated, source-backed editions and craft provenance stories without creating a parallel content-truth system.

**Architecture:** Add a derived maison information architecture over existing localized routes and canonical product/release/architecture/evidence sources. Journal editions and craft stories reference source identities; they never create capability, release, proof, customer, or architecture truth.

**Tech Stack:** Astro 7, TypeScript 6, content collections/existing canonical data adapters, HTML/CSS, Node tests, Playwright, axe.

**Spec:** `docs/superpowers/specs/2026-09-16-c4-quiet-authority-digital-maison-design.md`

## Global Constraints

- Implements G1, G6, G9 only.
- Requires C4-A craft contracts and relevant C3 release/product/architecture truth adapters.
- Do not rename/delete authoritative routes merely to fit the Maison metaphor.
- No second route registry, product registry, release registry, or editorial fact registry.
- An edition may curate only resolvable public items; missing/private/unpublished references fail closed.
- Craft stories require source-backed problem/design/constraint/evidence/limitation data; no retrospective invention.
- EN/VI parity and static/no-JS completeness are mandatory.

---

### Task 1: Define Maison information architecture adapter

**Files:**
- Create: `src/lib/maison.ts`
- Create: `tests/architecture/c4-maison-contract.test.mjs`
- Read: existing public route helpers, product, trust, architecture, support, release routes

**Interfaces:**
- Produces `getMaisonSections(lang)` returning ordered public section descriptors for Products, Proof, Architecture, Journal, Studio.
- Each descriptor references existing localized route helpers/known public routes rather than hard-coded duplicate navigation truth.

- [ ] **Step 1: write failing contract tests**

Require five conceptual sections, locale-safe links, no duplicate route registry, no unknown/private destination, and deterministic ordering.

- [ ] **Step 2: prove RED**

```bash
node --test tests/architecture/c4-maison-contract.test.mjs
```

- [ ] **Step 3: implement pure adapter**

Map existing public surfaces into maison sections. If a conceptual destination does not yet have a public route, expose no fabricated link; use only resolvable destinations.

- [ ] **Step 4: prove GREEN and static-link compatibility**

```bash
node --test tests/architecture/c4-maison-contract.test.mjs
pnpm check:static-links
```

### Task 2: Add Maison orientation surface

**Files:**
- Create: `src/components/maison/MaisonIndex.astro`
- Modify selected home/about navigation surface after live design review
- Modify: `src/styles/c4-quiet-authority.css`
- Create: `tests/e2e/c4-maison.spec.ts`

**Interfaces:**
- Consumes `getMaisonSections(lang)`.
- Produces a calm editorial orientation layer; ordinary links remain authoritative.

- [ ] **Step 1: write browser assertions**

Assert all visible sections resolve, no duplicate primary nav, keyboard order matches DOM order, mobile remains a deliberate vertical composition, and no JS is required.

- [ ] **Step 2: implement restrained orientation**

Use editorial hierarchy and whitespace rather than dashboard cards. Do not make the metaphor more important than route clarity.

- [ ] **Step 3: verify EN/VI, no-JS, axe, 320/390/1440**

### Task 3: Define source-backed edition schema

**Files:**
- Create: `src/lib/editions.ts`
- Create: `src/content/editions/` only if the live content architecture supports authored curation without duplicating truth
- Create: `tests/architecture/c4-edition-contract.test.mjs`

**Interfaces:**
- Produces edition records containing `id`, localized title/deck, ordered source references, optional editorial note, and authored publication metadata.
- Source references resolve to canonical public release/product/architecture/evidence/craft items.

- [ ] **Step 1: write RED schema/resolution tests**

Reject unknown source IDs, private/unpublished items, generated dates, duplicate edition IDs, unsupported significance claims, and source-free feature claims.

- [ ] **Step 2: implement deterministic resolver**

Resolve each edition item at build time. Unknown/private references exclude or fail according to current public-truth doctrine; never silently replace with marketing copy.

- [ ] **Step 3: add non-vacuity tests**

Synthetic unknown/private references must fail.

### Task 4: Publish Collected Edition routes

**Files:**
- Create localized journal/edition page templates following the repository’s existing localized page pattern at execution time
- Create: `src/components/editorial/EditionIndex.astro`
- Create: `src/components/editorial/EditionStory.astro`
- Modify: `src/styles/c4-quiet-authority.css`
- Create: `tests/e2e/c4-editions.spec.ts`

**Interfaces:**
- Consumes resolved edition records only.
- Produces static public editorial pages with source/provenance links and authored publication dates.

- [ ] **Step 1: write route/link/semantic tests**

Require one h1, valid localized alternates, visible source links, no unsupported release/product claims, print readability, and no-JS completeness.

- [ ] **Step 2: implement static edition pages**

Use C4 folio/type/material roles. Avoid infinite feed, engagement counters, social proof fabrication, or fake issue volume.

- [ ] **Step 3: verify sitemap/robots/static links/SEO**

### Task 5: Define Craft Provenance Story contract

**Files:**
- Create: `src/lib/craft-stories.ts`
- Create: `tests/architecture/c4-craft-story-contract.test.mjs`

**Interfaces:**
- Produces source-backed story sections: `problem`, `designChoice`, `constraint`, `implementation`, `evidenceRefs`, `limitations`.
- Every substantive section maps to authored canonical/public source evidence or is explicitly omitted.

- [ ] **Step 1: write fail-closed tests**

Reject stories that invent customer outcomes, hide limitations, cite only themselves, reference unknown evidence, or imply certifications/assurance not present in truth.

- [ ] **Step 2: implement resolver over canonical sources**

Do not copy evidence text into story truth. Render human-readable narrative from authored story fields plus resolvable references.

### Task 6: Render Craft Provenance Stories

**Files:**
- Create: `src/components/editorial/CraftStory.astro`
- Integrate only where a real product/system has enough source truth
- Create: `tests/e2e/c4-craft-story.spec.ts`

**Interfaces:**
- Consumes only validated craft-story view models.
- Produces a static narrative with evidence and limitation paths.

- [ ] **Step 1: write empty/partial/full state tests**

No sufficient source truth means no fake story. Partial sourced narratives may render only the substantiated sections.

- [ ] **Step 2: implement static-first story component**

- [ ] **Step 3: verify accessibility, EN/VI, 320/390, print, no-JS**

## Verification and exit criteria

C4-B exits when:

- Maison orientation derives from real routes and does not duplicate global navigation authority;
- editions resolve only public source-backed items and do not inflate release significance;
- craft stories expose limitations and evidence rather than marketing-only narratives;
- no new truth registry or client framework is introduced;
- EN/VI, SEO, static links, accessibility, responsive, print/no-JS and client-budget gates are green; and
- exact-head + post-merge production evidence confirms published routes and no truth leakage.
