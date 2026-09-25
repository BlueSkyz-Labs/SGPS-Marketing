# Product registry

YAML/JSON entries are added only after the public-product audit passes.

## Required fields (C1.1)

- Identity, jobs-to-be-done, platforms, CTA, proof, endorsement, provenance.
- **Public** entries also require **2–3 verified `capabilities`** (product abilities), distinct from `jobs` (customer jobs).
- Optional `proof.media` must be a **local** object:

```yaml
proof:
  media:
    src: /products/example/evidence.webp # must live under public/products/
    alt: Concise description of the brand artifact
    width: 1600
    height: 900
```

Remote media URLs are rejected: CSP `img-src 'self' data:` cannot load them, and invented proof is prohibited.
