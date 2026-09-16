# C4-F — Private Evaluation Room Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a separately gated enterprise evaluation workspace for approved prospect-specific materials with strong authentication, authorization, revocation, auditability, privacy, recovery, and strict isolation from the public site.

**Architecture:** This is a distinct application/security boundary, not a hidden public page. No production implementation begins until a dedicated architecture/privacy/security ADR chooses identity/session/data/runtime providers and defines data classification, RBAC, retention, revocation, recovery, audit, incident response, cost, and operational ownership. Public BlueSkyz truth may be referenced, but private evaluation data never becomes public truth.

**Tech Stack:** Provider/runtime intentionally undecided by this plan. The public Astro site remains decoupled. Repository testing must include Node/contract tests plus provider/runtime security tests chosen by the approved ADR.

**Spec:** `docs/superpowers/specs/2026-09-16-c4-quiet-authority-digital-maison-design.md`

## Global Constraints

- Implements G8 only.
- **NO RUNTIME IMPLEMENTATION before the dedicated ADR is approved.**
- ADR number `0009` is reserved by this approved C4 plan; execution must refresh `docs/decisions/` first and resolve any numbering conflict through repository authority rather than overwriting an unrelated decision.
- Security by default: deny-by-default authorization, least privilege, short-lived access, explicit revocation, no security-through-obscurity URLs.
- Authentication success never implies authorization.
- Tenant/prospect boundaries must be enforced server-side on every object/action; never trust client-supplied ownership.
- Private evidence/material may not be copied into public static bundles, public manifests, search indexes, analytics, error messages, or client logs.
- No secrets in repository/config templates. Use provider secret stores/runtime bindings after approval.
- Every irreversible/high-impact operation requires explicit design for recovery, audit, and owner control.
- The subsystem must have a kill/disable path independent of the public marketing site.

---

### Task 1: Write Private Evaluation architecture/privacy/security ADR

**Files:**

- Create: `docs/decisions/0009-c4-private-evaluation-room.md`
- Create: `docs/security/2026-09-16-c4-private-evaluation-threat-model.md`; record actual threat-model review timestamps/revisions inside the document
- Create: `docs/evidence/2026-09-16-c4-private-evaluation-go-gate.md`; record the exact approved/rejected revision and observed timestamp

**Interfaces:**

- Produces approved decisions for: identity provider, session model, runtime, storage, encryption, tenant/prospect isolation, RBAC roles, invite lifecycle, expiry, revocation, audit events, retention/deletion, backups, recovery, incident response, domain, rate limits, abuse controls, operational ownership, and cost ceiling.

- [ ] **Step 1: inventory data classes and actors**

Explicitly classify public truth, prospect metadata, private documents, evidence, comments/notes if any, audit logs, identity/session data, and administrative metadata. Define which classes are allowed to persist and for how long.

- [ ] **Step 2: threat model real abuse paths**

At minimum model IDOR/BOLA, privilege escalation, stale entitlement, invite theft/replay, session theft/fixation, CSRF where applicable, XSS, open redirect, path traversal/file download abuse, metadata enumeration, brute force, rate-limit bypass, log leakage, storage bucket exposure, cache poisoning, cross-tenant indexing, email forwarding, administrator compromise, provider outage, credential loss, and recovery failure.

- [ ] **Step 3: define role/permission matrix**

Use explicit resource/action permissions. Avoid a broad “admin can do everything” runtime assumption without emergency controls/audit.

- [ ] **Step 4: define GO/NO-GO criteria**

No code until provider/runtime, threat mitigations, data retention, recovery, and owner operational path are objectively approved.

### Task 2: Add repository isolation guard before implementation

**Files:**

- Create: `tests/architecture/c4-private-evaluation-boundary.test.mjs`
- Modify build/dependency guards only if the approved architecture adds a separate package/app boundary

**Interfaces:**

- Produces fail-closed checks that private-room code/data is absent from public critical imports/static output and that public code has no hard dependency on the private runtime.

- [ ] **Step 1: write RED guard against hypothetical leakage**

Synthetic imports/private paths/provider secrets/private data in public bundles must fail.

- [ ] **Step 2: implement boundary according to approved ADR**

Prefer a distinct application/package/deployment boundary if that best preserves isolation; do not force it into Astro public routes for convenience.

### Task 3: Implement identity/session foundation after GO

**Files:**

- Runtime/provider paths are defined in `docs/decisions/0009-c4-private-evaluation-room.md` before this task starts; amend this plan in a dedicated docs PR if those exact paths differ from the approved application boundary.
- Create dedicated authn/authz contract tests and integration tests in the application boundary defined by ADR 0009.

**Interfaces:**

- Produces authenticated principal/session with immutable subject identity and server-validated entitlement context.

- [ ] **Step 1: write auth/session negative tests first**

Cover unauthenticated access, expired/revoked invite, expired session, session replay, logout invalidation, passwordless/OAuth callback tampering as applicable, and missing/invalid state/nonce/PKCE where applicable.

- [ ] **Step 2: implement provider integration with least privilege**

- [ ] **Step 3: verify session cookie/token protections**

Require secure transport, appropriate Secure/HttpOnly/SameSite or equivalent token protections, bounded TTL, rotation/revocation semantics, and no tokens in URLs/logs.

### Task 4: Implement deny-by-default authorization

**Files:**

- Create dedicated policy module according to ADR 0009
- Create authorization unit/integration tests in the same isolated application boundary

**Interfaces:**

- Produces `authorize(principal, action, resource)` or equivalent policy decision with explicit deny default.

- [ ] **Step 1: build a permission matrix test suite**

Cover viewer/evaluator/owner/support/admin-equivalent roles defined by ADR, cross-prospect resources, expired access, removed membership, and unknown action/resource types.

- [ ] **Step 2: enforce server-side object ownership on every read/write/download**

- [ ] **Step 3: red-team IDOR/BOLA**

Manipulated IDs/URLs/body fields must never cross access boundaries.

### Task 5: Implement private artifact lifecycle

**Files:**

- Storage/data modules defined by ADR 0009
- Upload/download metadata validation tests if uploads are approved
- Retention/deletion tests

**Interfaces:**

- Produces bounded artifact records with classification, owner/scope, created/expiry/retention metadata, and auditable lifecycle.

- [ ] **Step 1: write content/metadata validation tests**

Reject unexpected file/content types, oversized inputs, path tricks, malformed metadata, unsafe inline rendering, and cross-scope references.

- [ ] **Step 2: implement safe delivery/rendering**

Prefer attachment/safe rendering for risky types; apply CSP/content-type/sniffing protections per ADR.

- [ ] **Step 3: verify expiry/deletion and backup implications**

Deletion semantics must account for backups/log retention honestly; do not promise immediate erasure if architecture cannot guarantee it.

### Task 6: Implement audit, revocation, incident and recovery controls

**Files:**

- Audit event schema/module defined by ADR 0009
- Create: `docs/operations/c4-private-evaluation-runbook.md`
- Create recovery/incident integration tests where automatable

**Interfaces:**

- Produces privacy-safe audit events for high-risk security/entitlement actions and operational procedures for disable/revoke/recover.

- [ ] **Step 1: define audited events**

At minimum login/auth failures as appropriate, invite creation/acceptance/revocation, role changes, artifact access/download where justified, admin changes, and emergency disable actions. Avoid logging secrets/private document content.

- [ ] **Step 2: implement emergency revocation/kill path**

Owner must be able to revoke a principal/prospect/session and disable the subsystem without public-site outage.

- [ ] **Step 3: test credential-loss/provider-outage recovery**

Document break-glass path, backup identity/admin path, restoration order, and evidence required before reopening service.

### Task 7: Production-grade security red team and promotion gate

**Files:**

- Create: `docs/evidence/2026-09-16-c4-private-evaluation-security-red-team.md`; record actual execution timestamp and exact candidate SHA
- Create: `docs/evidence/2026-09-16-c4-private-evaluation-production-readback.md`; record exact deployed revision and observed timestamp

- [ ] **Step 1: run SAST/dependency/supply-chain gates plus provider-specific security tests**

- [ ] **Step 2: actively test authorization abuse, session abuse, injection/rendering, storage exposure, tenant isolation, rate limits, stale entitlements, audit gaps, and recovery**

- [ ] **Step 3: require all critical/high findings fixed or explicitly owner-held outside automation**

No autonomous root-risk acceptance.

- [ ] **Step 4: promote only exact tested revision**

No bypass and no merge/deploy on red.

## Verification and exit criteria

C4-F can be marked complete only when:

- ADR 0009/threat model is approved and implemented exactly;
- authentication and authorization are independently tested;
- object/tenant boundaries resist IDOR/BOLA and stale entitlement;
- data classification, retention/deletion, logging, encryption, revocation, incident response and recovery are operational;
- private data cannot leak into public builds/manifests/search/telemetry;
- the subsystem can be disabled independently;
- security red-team evidence has no unresolved critical/high defect accepted by automation; and
- production read-back confirms exact deployed revision and access controls.
