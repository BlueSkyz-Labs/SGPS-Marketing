# ADR 0013 — C3-E Verifiable Concierge architecture, privacy and security gate

- **Status:** Proposed — **runtime model calls remain NO-GO (default deny)**, inheriting ADR 0011.
  The deterministic concierge (Option A) and build-time AI assistance (Option B) are **GO** under
  this ADR's constraints; Options C/D require the owner-filled fields below; Option E is deferred.
- **Date:** 2026-10-04
- **Scope:** the C3-E Verifiable Concierge and any model-assisted surface on this site.
- **Owner decision required:** yes — for Options C/D only (provider, runtime, logging/retention,
  abuse controls, cost ceiling). A and B need no owner fields: they introduce no runtime data flow.
- **Supersedes:** nothing. **Extends:** ADR 0011 (the briefing-synthesis NO-GO), whose fields,
  threat model and default-deny posture apply verbatim to any runtime model path here.

## Context

The C3-E plan (`docs/superpowers/plans/2026-09-13-c3-e-verifiable-concierge.md`) mandates this
ADR before any runtime work and forbids remote model calls until it is approved. The site today is
an assets-only Workers bundle: no `main` script, no database, no analytics/RUM, a zero-tracking
posture, and a deliberately strict CSP (`script-src 'self'; connect-src 'self'`).

An options study (2026-10-04, vendor pages; unverifiable items marked NOT VERIFIED) established:

| #   | Option                                                                                     | Visitor text leaves device?                                         | Monthly floor                                              | New Worker `main`? | CSP change                                         |
| --- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------ | -------------------------------------------------- |
| A   | Deterministic concierge: guided navigation + client-side search over the public corpus     | **never**                                                           | $0                                                         | no                 | **none**                                           |
| B   | Build-time AI-assisted content (offline authoring; site stays static)                      | never                                                               | dev-time only                                              | no                 | **none**                                           |
| C   | Cloudflare Workers AI via a thin same-origin Worker (`/api/concierge`), optional Vectorize | yes → origin → Cloudflare GPU (single provider)                     | $0 free tier (10k neurons/day ≈ 380 answers/day) / $5 paid | **yes**            | **none** (`connect-src 'self'` already permits it) |
| D   | External LLM API via thin Worker proxy (OpenAI/Anthropic/Google)                           | yes → origin → third party (second jurisdiction + retention regime) | $0 idle / paid tier required for admissible privacy terms  | yes                | none                                               |
| E   | On-device (WebLLM / Prompt API)                                                            | never                                                               | $0                                                         | no                 | **required widening** (`'wasm-unsafe-eval'`)       |

**Repo-specific facts that drive this decision** (verified by inspection):

1. `connect-src 'self'` is already present — a same-origin `/api/concierge` needs **zero CSP
   relaxation**. This is the single most important architectural fact for this site.
2. `tests/architecture/security-surface.test.mjs` **actively fails the build** on
   `'unsafe-inline'`/`'unsafe-eval'` in `script-src`; Option E therefore requires amending a
   blocking guard (a real ADR + reverse-mutation proof), not a config tweak.
3. `scripts/check-client-budget.mjs` enforces a 120,000-Brotli-byte client-JS budget (current
   total ~1.6 KB); the WebLLM runtime alone is ~306 KB before weights — Option E cannot ship on
   the critical path.
4. `wrangler.toml` sets `[observability.logs] persist = true, invocation_logs = true`. **Any new
   POST route would persist visitor prompts in Workers Logs by default.** `redact_query_string`
   does not help — the prompt travels in the request body. This is a live risk the ADR must close
   before C/D.
5. `workers_dev = false` and `preview_urls = false` already hold — a new `/api/*` route cannot be
   reached around the intended hostname, WAF or Access posture.
6. Option E's locale coverage is unproven for vi/zh/zh-hant (Chrome's Prompt API documents
   en/es/ja/de/fr) and its hardware gates exclude mobile-first visitors — likely most of this
   site's audience.

## Decision

**1. Option A (deterministic concierge) is GO now.** A build-time corpus adapter + client-side
search (Pagefind or Orama, self-hosted, no CDN, no telemetry) + template-composed,
citation-backed answers, degrading to the deterministic navigation. Constraints: no runtime
model, no network call on query, per-locale index shards, negative leakage tests against the
public corpus only, and the no-JS path stays the baseline.

**2. Option B (build-time AI-assisted content) is GO.** Models may assist authoring/CI offline;
every generated artifact is human-reviewed and committed as content. No runtime surface, no CSP
change. AI-drafted content must satisfy the same public-truth and glossary gates as hand-written
content (no fabricated facts, no unsupported claims).

**3. Options C/D (runtime model calls) remain NO-GO by default**, inheriting ADR 0011 verbatim.
They may move to Accepted only when the owner fills every field below **and** the following
pre-conditions are implemented and independently verified:

- the observability leak is closed (route excluded from `invocation_logs`, or `persist` disabled
  for the API surface) with a guard test;
- abuse controls are live before launch: the rate-limiting binding, AI Gateway limits/spend caps,
  Turnstile on the endpoint, and a documented kill switch that degrades to Option A;
- the endpoint accepts no unbounded input (length caps), returns citations for every substantive
  answer, fails closed to "out of scope", and never lets user text alter retrieval or citation
  policy (ADR 0011's threat model applies in full);
- the ADR records that **no data-residency guarantee exists for Workers AI** (Jurisdictional
  Restrictions unsupported; no published zero-retention window — NOT VERIFIED) and that the owner
  accepts this, or selects a documented alternative.

**4. Option E is deferred** with this written revisit trigger: a future ADR that relaxes the CSP
guard for a self-hosted, opt-in, lazy-loaded runtime **and** amends the client-JS budget
explicitly — not before, and never on the critical path.

### Fields the owner must fill before any C/D GO

| Field                                                                                                      | Current value                                       |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Provider and model identity (recommended first candidate: Workers AI `glm-4.7-flash`; `gpt-oss-20b` alt)   | undecided                                           |
| Runtime and where it executes (recommended: same-origin `/api/concierge`, `run_worker_first = ["/api/*"]`) | undecided                                           |
| Data sent / prompt corpus boundary (public corpus only; no personal data)                                  | undecided                                           |
| Log retention — prompts stored? (must close the `persist` gap first)                                       | **open risk identified**                            |
| Abuse, rate limit and prompt-injection handling                                                            | undecided                                           |
| Cost ceiling and breach notification (unit ≈ $0.0002/answer on the recommended model)                      | undecided                                           |
| Outage behaviour                                                                                           | deterministic Option A baseline (already specified) |
| Residency acceptance (no guarantee available — accept or choose alternative)                               | undecided                                           |

## Threat model (applies to every accepted path)

Prompt injection (user text is untrusted and may never change retrieval/citations); source
poisoning (only the approved public corpus; no invented product/claim/evidence facts); citation
laundering (output passes the existing citation policy or returns out-of-scope); retention creep
(conversation text never becomes profiling or marketing data; the logging gap above is the first
enforcement point); cost/availability (the site never depends on the model; failure degrades to
Option A); index leakage (search indexes only public corpus records — negative tests required).

## Consequences

- The concierge's user-facing value (source-bound, cited, fails-closed answers) largely ships
  **without any model** — Option A absorbs guided-navigation demand at zero data boundary and zero
  cost; Option B raises corpus quality at dev-time cost only.
- No CSP, budget, observability or privacy contract changes for A/B — the current security posture
  is preserved exactly.
- Any future C/D implementation must update this ADR's status and table first, then proceed under
  the C3-E plan; D remains a documented fallback inside this same ADR (provider swap behind the
  proxy), not a parallel track.
- If the owner never fills the fields, A+B is a complete, valid outcome — consistent with ADR
  0011's stance that the deterministic product is finished product.

## Authority

- `docs/superpowers/plans/2026-09-13-c3-e-verifiable-concierge.md` (Task 1 = this ADR; Global
  Constraints: no remote model calls before approval, citations required, no profiling).
- ADR 0011 — Model-assisted briefing synthesis stays off until explicitly approved (fields,
  threat model, default deny).
- `docs/current-work.json` — the Concierge provider/privacy gate as an open owner decision.
- Options study 2026-10-04 (vendor pricing pages; NOT VERIFIED items listed in the study record).
