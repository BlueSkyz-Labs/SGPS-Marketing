# Product registry

YAML/JSON entries are added only after the public-product audit passes.

## Required fields (C1.1)

- Identity, jobs-to-be-done, platforms, CTA, proof, endorsement, provenance.
- **Public** entries also require **2–3 verified `capabilities`** (product abilities), distinct from `jobs` (customer jobs).
- Optional `applicationCategory` is a schema.org application category (for example `BusinessApplication`). It feeds the product's SoftwareApplication JSON-LD; leave it out rather than guess, and the JSON-LD then carries no category.
- Optional `proof.media` must be a **local** object:

```yaml
proof:
  media:
    src: /products/example/evidence.webp # must live under public/products/
    alt: Concise description of the brand artifact
    width: 1600
    height: 900
```

Set `taglineHold: true` on identity art whose baked-in tagline is not confirmed against the product's own truth (OG-3). Every surface reads media through `displayableMedia()` in `src/lib/products.ts`, so held art is never rendered or linked. The file itself is still served at its public path until a tagline-free lockup replaces it.

Remote media URLs are rejected: CSP `img-src 'self' data:` cannot load them, and invented proof is prohibited.
