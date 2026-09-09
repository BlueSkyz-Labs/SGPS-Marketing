# ADR 0007 — SGPS-native canonical architecture model

**Date:** 2026-09-09  
**Status:** Accepted

## Context

The repository has strong implementation, deployment, security and Experience contracts, but architecture knowledge has been distributed across ADRs, plans, code and provider evidence. A diagram or prose document alone is not sufficient as architecture truth: authored edges can drift, views can omit dependencies, and a visually correct diagram does not prove topology correctness.

The current product is a static Astro marketing system deployed through Cloudflare Workers Static Assets. It has no application authentication, server API, database, queue, tenant store or mutable business transaction. The architecture model must represent that reality without fabricating backend entities merely to satisfy a framework taxonomy.

## Decision

`architecture/sgps-model.json` is the canonical SGPS-native machine-readable architecture model for this repository.

The model:

- uses stable typed IDs across Portfolio → Domain → System → Component/Data Resource/Infrastructure Resource/External Dependency/Deployment;
- records ownership, lifecycle, criticality, data classification, trust boundaries and environment/region metadata where applicable;
- binds repository-dependent claims to immutable Git evidence revisions;
- fails closed on duplicate IDs, unknown parents/endpoints, parent cycles, invalid relationship types and self-relationships through `tests/architecture/sgps-architecture-model.test.mjs`;
- intentionally omits API/Event/backend entities until repository or runtime evidence proves they exist;
- carries the invariant `VIEW_IS_DERIVED_NOT_ARCHITECTURE_TRUTH`.

`architecture/derived-views.json` is generated deterministically from the canonical model by `scripts/generate-architecture-views.mjs`. It provides Portfolio Landscape, System Context, Container/Component, Dependency, Data Flow, Deployment, Security/Trust and Ownership viewpoints. These views are communication artifacts only; they never become a competing source of truth.

External renderers such as Archify, Structurizr or LikeC4 may be added later only as isolated derived adapters after normal license/security/supply-chain review. They are not portfolio mandates and cannot own architecture truth.

## Consequences

- Architecture-affecting changes must update the canonical model and regenerate derived views in the same reviewed change.
- `pnpm architecture:views:check` and architecture tests provide deterministic drift detection.
- Absence of an authored edge is not evidence that no runtime dependency exists; provider/runtime observations outrank stale model claims and must trigger reconciliation.
- The model stays intentionally small for this static system. Expanding taxonomy without evidence is treated as architecture noise, not progress.
