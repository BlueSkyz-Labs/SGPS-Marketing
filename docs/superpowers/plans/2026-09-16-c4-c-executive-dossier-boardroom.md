# C4-C — Executive Dossier & Boardroom Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let enterprise evaluators compose and present boardroom-ready views of approved BlueSkyz truth without inventing claims, requiring a server runtime, or creating persistent visitor profiles.

**Architecture:** Build a deterministic dossier compiler over canonical public selectors. Selection state is ephemeral/local and allowlisted; generated dossiers and presentation mode are derived views with explicit source, boundary, freshness, and unknown semantics. Static public source pages remain authoritative.

**Tech Stack:** Astro 7, TypeScript 6, HTML/CSS, small vanilla client module only for local selection/presentation controls, print CSS, Node tests, Playwright, axe, Lighthouse.

**Spec:** `docs/superpowers/specs/2026-09-16-c4-quiet-authority-digital-maison-design.md`

## Global Constraints

- Implements G2 and G3 only.
- Requires relevant C3 product/proof/architecture/release/public-truth adapters.
- No server persistence, cookies, visitor account, hidden scoring, remote analytics, or model-generated facts in this wave.
- Dossier selection accepts allowlisted public IDs only; unknown/private IDs fail closed.
- Presentation mode may change composition, not facts, evidence visibility, or material caveats.
- Print/export must not imply a signed, certified, guaranteed, or contractually current document.
- EN/VI, no-JS source access, keyboard/touch, print, 320/390 and reduced motion remain mandatory.

---

### Task 1: Define Dossier view model and compiler

**Files:**
- Create: `src/lib/dossier.ts`
- Create: `tests/architecture/c4-dossier-contract.test.mjs`
- Read: canonical product/claim/evidence/architecture/release selectors

**Interfaces:**
- Produces `compilePublicDossier(input, lang)` where input is an allowlisted set of public IDs and sections.
- Returns deterministic sections with source references, truth/boundary state, authored freshness where available, and explicit unknown/missing states.

- [ ] **Step 1: write failing compiler tests**

Cover valid product/evidence/architecture selections, unknown IDs, private/unpublished references, duplicate IDs, invalid locale, source freshness absent, and empty selection.

- [ ] **Step 2: prove RED**

```bash
node --test tests/architecture/c4-dossier-contract.test.mjs
```

- [ ] **Step 3: implement minimal pure compiler**

No network, storage, random values, generated timestamps, or free-text truth fields. Use canonical selectors and stable public identifiers.

- [ ] **Step 4: add non-vacuity/security tests**

Synthetic script/URL-like IDs and internal path fragments must not be reflected into output.

### Task 2: Build public Dossier Composer shell

**Files:**
- Create: `src/components/dossier/DossierComposer.astro`
- Create: `src/components/dossier/DossierPreview.astro`
- Create: `src/scripts/dossier-composer.ts`
- Add localized routes following the live repository route pattern
- Modify: `src/styles/c4-quiet-authority.css`
- Create: `tests/e2e/c4-dossier-composer.spec.ts`

**Interfaces:**
- Consumes a build-time list of public allowlisted items and `compilePublicDossier`.
- Local client state may contain only selected public IDs and presentation preferences; nothing transmits or persists.

- [ ] **Step 1: write no-storage/no-network architecture guard**

Reject `fetch`, XHR, beacon, WebSocket, cookies, local/session storage, IndexedDB, and remote script imports inside the composer module.

- [ ] **Step 2: write browser flow tests**

Select/deselect items with mouse, keyboard, and touch; invalid URL state fails closed; reload returns safe default unless state is explicitly encoded in validated URL parameters; all source links remain reachable.

- [ ] **Step 3: implement local composer**

Prefer progressive enhancement: source catalog and core content remain in semantic HTML. JS only coordinates selection/presentation.

- [ ] **Step 4: verify client-byte delta and reduced/no-JS behavior**

No-JS must still expose source pages and a useful explanation that interactive composition requires enhancement.

### Task 3: Define print-ready dossier document

**Files:**
- Create: `src/components/dossier/DossierDocument.astro`
- Modify print CSS in the focused C4 stylesheet or existing print layer according to live ownership
- Create: `tests/e2e/c4-dossier-print.spec.ts`

**Interfaces:**
- Consumes compiled public dossier only.
- Produces a printable derived document with identity, section headings, sources, boundaries, and “generated from public source truth” context.

- [ ] **Step 1: write print contract**

Require readable pagination, source URLs or public identifiers, visible caveats/unknowns, authored freshness only, no interactive-only controls, and no internal metadata.

- [ ] **Step 2: implement print semantics**

Use real headings/lists/tables where appropriate. Avoid background-dependent meaning.

- [ ] **Step 3: verify print screenshot/PDF-style browser rendering**

Use Playwright print media checks; never assert a PDF certification status.

### Task 4: Build Boardroom Presentation Mode

**Files:**
- Create: `src/components/dossier/BoardroomDeck.astro`
- Create: `src/scripts/boardroom-mode.ts`
- Create: `tests/e2e/c4-boardroom-mode.spec.ts`
- Modify: `src/styles/c4-quiet-authority.css`

**Interfaces:**
- Consumes compiled dossier sections.
- Produces one-dominant-idea-per-screen presentation view with keyboard/touch controls and direct source access.

- [ ] **Step 1: write navigation and accessibility tests**

Arrow keys/explicit controls move between sections; Escape exits; focus is visible; controls have names/states; no focus trap; direct source links remain standard links.

- [ ] **Step 2: implement presentation mode without route interception**

Do not hijack browser navigation or scrolling globally. Presentation is a contained view state with deterministic section order.

- [ ] **Step 3: verify reduced motion and screen sizes**

Transition absence must not reduce comprehension. Test 1440, 1024, 390, and 320px.

### Task 5: Add Dossier provenance and freshness footer

**Files:**
- Create or reuse: `src/components/dossier/DossierSources.astro`
- Extend: `tests/architecture/c4-dossier-contract.test.mjs`
- Extend browser/print tests

**Interfaces:**
- Produces grouped public source references and per-item freshness only when authored canonical metadata exists.

- [ ] **Step 1: fail closed on missing/unknown sources**

Unknown source references must never render a convincing-but-broken citation.

- [ ] **Step 2: render source/boundary/unknown semantics**

No “verified”, “approved”, “certified”, or freshness badge unless the canonical source vocabulary explicitly supports the exact public statement.

## Verification and exit criteria

C4-C exits when:

- dossier output is deterministic and source-bound;
- user selection is allowlisted, ephemeral, non-transmitting, and non-persistent by default;
- boardroom mode changes presentation only and preserves caveats/sources;
- print output exposes provenance and does not imply certification/contract status;
- invalid IDs and injection-like inputs fail closed;
- no-JS source access remains useful;
- EN/VI, keyboard/touch, reduced motion, 320/390, print, axe, Lighthouse, client budget and static-link checks pass; and
- exact-head and production read-back evidence are green.
