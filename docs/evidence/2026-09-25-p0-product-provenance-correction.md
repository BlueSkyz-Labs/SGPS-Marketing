# P0 product truth — provenance correction and gate hardening (2026-09-25)

Branch `feat/p0-blueskyz-product-house` (PR #269) shipped a public five-product registry whose
provenance did not withstand verification. This records the finding, the correction, and the guard
change that makes the defect class detectable, so a later reader does not have to re-derive it.

## Finding (independently verified, not taken from the PR narrative)

1. **`proof.repositoryUrl` pointed at repositories that do not exist.** All five returned HTTP 404:
   `BlueSkyz-Labs/PRJ_ApexAgent`, `PRJ_FluentArc`, `PRJ_SoTam`, `PRJ-SoTro`, `PRJ_VungTayLai`.
   The real repositories are `ApexAgent`, `FluentArc`, `sotam`, `Sotro`, `VungTayLai` (all private).
2. **`sourceRevision` was fabricated.** The same value appeared in all five records —
   `5a0d79a2f2d095c5653c670d28a13e5b6dacbf86` — and it is the merge commit
   "feat(c4-c): boardroom presentation mode (Task 4) (#267)" **of this repository**.
3. **Composed brand banners were labelled as product screenshots.** `public/products/*/screenshot.png`
   are icon + tagline + endorsement lockups (e.g. Sotro at 1800×504) with no product UI.
4. **`apexagent.yaml` claimed `lifecycle: active`, `availability: public`, `publicLabel: Available`**
   while its repository is private and no released artifact evidenced the claim.

## Correction

- `proof.repositoryUrl` now cites the real repositories; `sourceRevision` now cites each product's
  verified revision, read from the GitHub API at correction time:
  `ApexAgent e5d1db8f5aa4dd11df026941571b1bd5e1f402b9` ·
  `FluentArc b74a3027dc5ebd4cd4b3a3502576dc0d1edba6bc` ·
  `sotam 38a4d850c23845134631afb31b52914a2ad56e53` ·
  `Sotro b226e491517f34d49286b117e2d2634f7d47e763` ·
  `VungTayLai bc23fd8c0782ee624e205f43206a1460f54d12a3`.
- The proof media field is declared as `proof.media` (brand and identity art), never as a
  screenshot of running software, in the schema, the components and the rendered `alt` text.
- Product lifecycle/availability/public label statements are consistent with the evidence that
  exists: private repository, development stage, no released artifact.

## Guard change (verify the verifier)

Before: `scripts/check-product-provenance.mjs` required only that `sourceRevision` resolve to a
commit reachable from **this** repository. The fabricated value satisfied that condition — the gate
proved only that the site cites itself, and it passed all five fabricated records.

After, per record: `slug` must match the file stem; `proof.repositoryUrl` must equal
`https://github.com/BlueSkyz-Labs/<repo>` for the slug's allow-listed repository; `sourceRevision`
must be 40-hex and must **not** resolve to an object of this repository; proof media must be
declared as `media`, not as a bare `screenshot` claim. An empty registry still reports IDLE.

The contract is covered by `tests/architecture/product-provenance.test.mjs`, including negative
cases for each defect above: a non-existent repository slug, a foreign organisation, a revision
that is a commit of this repository, a missing or malformed revision, and identity art claimed as a
screenshot. The empty-registry branch is covered by
`tests/architecture/product-empty-branch.test.mjs` (loader count for an empty registry, for a
private-only registry, and the localized empty-state contract), because the browser suite can no
longer reach the empty route while products are published.

## Not verified here / owner-gated

- The guard is offline: it cannot prove a foreign revision still exists, only that the record does
  not misattribute this repository's own history. Re-verification of the five revisions needs
  repository access (GitHub API) and was performed once, manually, at correction time.
- Whether each product may be presented as publicly available, and whether real product captures may
  be published, remains an Owner decision. Nothing here asserts either.
