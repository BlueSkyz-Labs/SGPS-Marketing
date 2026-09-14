# C2 P3 — product storytelling (Flagship Theatre + Product House hierarchy)

Date: 2026-09-14
Wave: C2 P3 (plan Tasks 7–9, PR-D)
Branch: `feat/c2-p3-product-storytelling-20260914`
Status: IN_PROGRESS (implementation verified; stop-at-PR — merge is owner-gated)

## Change

C2 Act II is now truth-driven end to end. Nothing in this wave invents a
product: every visible fact still comes from the product record, and the
production registry remains intentionally empty behind the owner-gated
screenshot floor.

- **Flagship Theatre** (`src/components/product/FlagshipTheatre.astro`) shows the
  factual status family through `ProductStatus` as a subordinate element instead
  of an ad-hoc act label, keeps the screenshot as the act's protagonist
  (intrinsic `width`/`height`, record `alt`, opacity 1), and carries the
  continuity hook `data-product-continuity="media"`.
  The loading decision is recorded in the component rather than guessed: the
  theatre sits immediately after the hero, so the media stays `loading="lazy"`
  with intrinsic dimensions (no CLS) instead of competing with the hero LCP.
- **Product House** (`src/components/product/ProductHouse.astro`) now renders the
  hierarchy through the single card implementation
  (`ProductCard.astro`, which gains `data-product-tier`): the hero tier leads as
  a full-width editorial block outside the secondary grid, and featured /
  ecosystem products stay reachable in a plain DOM-ordered grid. Labels remain
  the canonical localized ones and actions keep their literal record labels —
  no cinematic CTA copy.
- **Product continuity** is one convention with one source
  (`src/lib/product-transition.ts`): `product-media-<slug>` for the theatre
  screenshot and `product-card-<slug>` for a product link, emitted as an inline
  `view-transition-name` (capability-detected by the browser, ignored where
  unsupported). No client router, no click interception, no hydration.
- **Cinematic layer**: `src/styles/cinematic-product-house.css` (already imported
  by `global.css`) gains the theatre's spatial layer — desktop-only, transform
  only, no opacity animation on the screenshot, with an explicit reduced-motion
  reset. The P2 Horizon Arrival art direction in the same file is untouched.
- **FeaturedProducts** stays a compatibility surface and is _not_ collapsed into
  Product House: `tests/architecture/customer-copy-hygiene.test.mjs` and
  `tests/architecture/experience-density.test.mjs` both pin its conditional
  render and its single top-level heading, and those contracts are kept rather
  than weakened.

## Tests added

- `tests/e2e/c2-flagship-theatre.spec.ts` — fixture-backed product-present
  rendering (name, status, capabilities, literal actions, canonical localized
  profile href, intrinsic screenshot dimensions, continuity uniqueness), a
  no-JavaScript contract, and real-site absence with the empty registry.
- `tests/e2e/c2-product-house.spec.ts` — hierarchy against fixture records: hero
  leads outside the secondary grid, all three tiers present and linkable, VI
  pages leak no EN labels.
- `tests/e2e/c2-product-continuity.spec.ts` — ordinary navigation baseline with
  reduced motion (EN + VI), a JS-disabled navigation contract, source-document
  name invariants (slug-derived, well-formed, unique), cross-document
  source→destination match, and real-site empty-registry honesty.
- `tests/architecture/product-continuity.test.mjs` — source-level guard: one
  naming source, no hardcoded transition names in the surfaces, no hydration
  directives or animation/framework imports.

Fixture truth lives in the throwaway parity app
(`tests/e2e/fixtures/parity-app`, never deployed): three synthetic records and a
destination page that mimics the canonical localized profile, so product-present
behaviour is provable while publication truth stays owner-gated.

## Evidence

```
pnpm typecheck                 → 0 errors / 0 warnings / 0 hints (103 files)
pnpm lint                      → clean (--max-warnings=0)
pnpm format:check              → All matched files use Prettier code style
pnpm test:architecture         → 338/338 (incl. product-continuity.test.mjs)
pnpm build                     → 30 pages, Static export verified
pnpm architecture:views:check  → PASS
pnpm check:client-budget       → PASS: site-wide 2600 B, worst page 2069 B < 120000 B
pnpm check:static-links        → PASS: 30 pages, 1016 links, 0 broken
pnpm check:publishability      → PASS (public truth, evidence, locale parity, product, claim integrity)
pnpm check:product-provenance  → IDLE (0 published products; guard activates on the first listing)
pnpm check:integrity-firewall  → PASS (10 drift classes)
playwright chromium + mobile-chromium (full project, fresh build)
                               → 721 passed, 1 skipped, 0 failed
c2 P3 specs (chromium)         → 35 passed
c2-product-continuity (firefox + webkit) → 16 passed, 0 failed
mobile-overflow + text-zoom    → 56 passed
```

## Compliance notes

- One coordinator-owned convention file (`src/lib/product-transition.ts`) is the
  only place a continuity name is built; three parallel writers each touched
  disjoint files, and the coordinator re-ran every acceptance check after them
  (one clobbered stylesheet and one guard-breaking compatibility refactor were
  caught and reverted here, not merged).
- CI `Browser Assurance` remains the truth-teller for the cross-browser matrix;
  local evidence above is the pre-push baseline.

## Residual (owner-gated, not worked around)

- The screenshot floor (`docs/current-work.json` → `screenshot-mandatory-floor`)
  is unchanged: zero public products publish, so the theatre and the Product
  House hero render nothing on the real site — absence remains the legal state.
- Finding (recorded, not silently fixed): the canonical localized profile route
  `/<lang>/products/<slug>/` has no page in this repository — only the legacy
  non-localized `/products/[slug]/` stub, which redirects to `/en/products/`.
  Product-present continuity is therefore proven against the fixture
  destination. Closing the route is product-truth work behind the same owner
  gate.
- Router staleness (recorded): `c2-p1` still reads PLANNED although PR #160
  merged, because no P1 evidence document exists and the router contract
  requires an existing file for a MERGED wave.
