# PR #79 Post-Merge Assurance & E4 Human-Evidence Gap — 2026-09-09

## Scope

This evidence record separates two different assurance classes that must not be conflated:

1. deterministic source/browser/deployment assurance for the current implementation; and
2. the real-user customer-task and brand-interpretation evidence required by the authoritative C1.1 experience contract.

No human result is inferred or fabricated in this record.

## Immutable post-merge baseline

PR #79 (`fix: enforce cross-browser E4 source assurance`) merged normally into `main` at:

```text
3737c726af1cffc2d9018096d7dc57b03cf6d127
```

Exact merge-SHA evidence:

| Evidence | Result |
| --- | --- |
| GitHub Source Assurance run `34320230835` — `Quality Gates` | PASS |
| GitHub Source Assurance run `34320230835` — full Playwright/axe matrix | PASS |
| Chromium | PASS through repository `pnpm test:e2e` matrix |
| Firefox | PASS through repository `pnpm test:e2e` matrix |
| WebKit / Safari-class | PASS through repository `pnpm test:e2e` matrix |
| Mobile Chromium project | PASS through repository `pnpm test:e2e` matrix |
| Lighthouse CI | PASS |
| Cloudflare Workers Build `59291439-2fd6-4573-887b-e4702d6c61c1` | PASS |
| Cloudflare version | `1dfd1475-6ff2-40db-a184-d46ba924e048` |

PR #79 also hardened the protected `Browser Assurance` contract so future protected candidates install Chromium, Firefox and WebKit and execute the repository-level `pnpm test:e2e` matrix instead of narrowing the promotion gate to Chromium only.

## Authoritative E4 human requirement

The substantive C1.1 experience contract at:

```text
docs/superpowers/specs/2026-09-03-blueskyz-web-v1-c1-1-design.md
```

requires, in addition to browser evidence:

- customer-task testing with **real users** performing discovery and trust tasks; and
- brand-interpretation testing covering comprehension, coherence, skepticism and recognition signals.

The contract therefore defines human evidence as a separate acceptance class. Automated Playwright, axe, Lighthouse, static validation, agent reasoning and LLM simulation cannot satisfy that requirement.

## Evidence actually present

The historical artifact:

```text
docs/evidence/2026-09-04-e4-web-validation.md
```

records:

- automated gates and Chromium evidence available at that time;
- `Customer task findings (agent walkthrough)`; and
- `Visual red team (agent)`.

Those are useful preflight findings, but the artifact does not claim a real-user study and must not be promoted into human acceptance by interpretation.

## Current determination

**Automated/browser E4: VERIFIED for merge SHA `3737c726af1cffc2d9018096d7dc57b03cf6d127`.**

**Human E4 customer-task / brand-interpretation acceptance: OPEN — EXTERNAL / HUMAN EVIDENCE REQUIRED.**

This open item does not invalidate the deterministic build/runtime assurance above. It means the C1.1 experience acceptance contract is not fully closed until real-user evidence exists.

## Closure contract for human E4

Human E4 may be marked complete only when an evidence artifact records a real study with representative participants and, at minimum:

1. the seven discovery/trust customer tasks represented by the existing C1.1 validation flow;
2. comprehension of what BlueSkyz Labs does and how its product-house framing is interpreted;
3. ability to locate relevant product/trust/support/responsibility information under the truthful current content state;
4. brand coherence and recognition observations;
5. an explicit skepticism/credibility probe that invites participants to identify anything that feels exaggerated, fake, unclear or untrustworthy;
6. anonymized findings, defects and severity; and
7. remediation + revalidation for any P0/P1 credibility or comprehension defects before closure.

Agent/LLM simulation may prepare scripts, analyze anonymized notes and help classify findings, but it must remain labelled preflight/simulation and never count as the real-user evidence itself.

## Safety / truth rule

If no real-user evidence exists, report `OPEN` or `UNKNOWN`; never synthesize participants, quotes, completion rates, sentiment, scores or acceptance outcomes to make E4 green.
