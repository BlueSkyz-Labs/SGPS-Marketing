# SGPS-DEC-2026-032 — Portfolio Observation: SGPS-Marketing local mapping

**Status:** `MAPPED` (preparation only). Nothing is collected or changed by this file.

**Canonical (merged 2026-10-04):**

- sgps-core `f3095644ba53624c8b4b3cfdf868f17c9abc50a9` (PR #262, `SGPS-DEC-2026-032`, status `DEFER`);
- sgps-control-plane `fe312257549e4bafb0426c0debd230495a362943` (PR #76, `FPD-2026-011`).

Market waves (Owner, 2026-10-04): Wave 1 Vietnam → Wave 2 Vietnamese speakers worldwide → Wave 3 neighbouring Southeast Asia (DEC-032 §8).

**Owner direction:** 2026-10-04, in the SGPS-Marketing session. Measure whether going global works, in aggregate, starting with Sổ Trọ and Sổ Tâm. Cover the web and every app, stay on the Free plan, and view everything in one portal (CXO).

## Role of this site

This site feeds the **Reach** stage of the go-global funnel for Sổ Trọ and Sổ Tâm, plus **Quality** and **Integrity**. It answers: _from which countries, and in which locale, do people come to the product pages?_

## Source and counting point

- **Source:** Cloudflare zone analytics for `blueskyzlabs.com` (S1): requests by country, status and cache, read by the control-plane publisher. No code change.
- **Measured fact:** the site is a static-assets Worker with no script. `wrangler.toml` has `[assets]` and no `main`.
- **Finer counting (S2):** per-locale path and per-product page counts in Workers Analytics Engine need a script in front of the assets. That is an architecture change to a static-first site, with performance and Trusted Types/CSP implications. It needs its own project decision, made after G1–G5. It is **not** authorized here.
- **No client beacon** (DEC-032 §2.5). The live CSP (`script-src 'self'; require-trusted-types-for 'script'`) stays unchanged.

## Event allowlist

None yet. S1 needs no events. Any future S2 events will be declared here first, each with its name, purpose, closed fields and expiry.

## Public truth (DEC-032 §2.9)

- The site publishes the claim `privacy-no-tracking-on-this-site`.
- Aggregate edge counts with no identifier must fit that claim's wording before G4. If they do not, the claim's text is updated in the same change that opens `rum-provider`.
- `docs/current-work.json` → `rum-provider` stays **OFF**.

## Open items found during mapping

1. **Workers Logs.** `wrangler.toml` enables `[observability.logs]` with `invocation_logs = true` and `persist = true`. Two things are `NOT VERIFIED`:
   - whether static-asset requests produce invocation logs;
   - which request fields those logs keep, and for how long.

   Review this under G3 (legal) together with the "no tracking" claim.

2. **Cloudflare JavaScript Detections**: CLOSED on 2026-10-04. A zone read-back showed Bot Fight Mode was already off and the injection came from standalone JavaScript Detections; `enable_js` is now `false` and no edge-injected script remains (`docs/evidence/2026-10-04-cloudflare-zone-readback.md`).

## Negative proofs required before `IMPLEMENTED`

- A published snapshot row with a count below 10 is rejected (publisher-side; owned by control-plane).
- If S2 is ever added: an event carrying an IP, an identifier or a free-form string fails its contract test.

## Status ladder

`MAPPED` (this file) → `IMPLEMENTED` → `VERIFIED` → `ADOPTED`. `ADOPTED` requires merged local evidence (SGPS AGENTS rule 54).
