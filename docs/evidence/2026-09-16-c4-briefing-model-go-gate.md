# C4-G — Model-assisted briefing GO gate (observed 2026-09-24)

- **Observed at:** 2026-09-24 09:50:26 (Asia/Ho_Chi_Minh, SEAST)
- **Repository revision observed:** `BlueSkyz-Labs/SGPS-Marketing@1265c53` (`origin/main` at observation time)
- **ADR:** `docs/decisions/0011-briefing-model-assisted-synthesis.md`
- **Disposition:** **NO-GO — pending owner approval** (not rejected; simply never decided)

## What was checked

1. **Is a dedicated ADR required before remote model calls?** Yes — C3-E plan Global
   Constraints: _"Do not implement remote model calls until a dedicated ADR is approved."_
2. **Does that ADR exist?** No. `docs/decisions/` at the observed revision contained ADR
   0001–0010 (with ADR 0009 filed twice, resolved separately), none of which approve a
   model, provider or runtime.
3. **Is any provider selected anywhere?** No — C3-E plan: _"No provider is selected by
   this plan."_; C4-G plan: _"Phase 2 runtime/model/provider intentionally undecided and gated."_
4. **Is the owner decision still open in the router?** Yes — `docs/current-work.json`
   carries the Concierge provider/privacy gate as pending owner action.
5. **Does anything currently call a model from this site?** No — C4-G Phase 1 is
   deterministic by contract test (no network, model, storage, random or clock primitive),
   and the client-budget/static gates pass without any model dependency.

## Exact disposition recorded

- **Approved:** nothing. No provider, runtime, corpus boundary, retention policy, abuse
  control or cost ceiling has been approved.
- **Rejected:** nothing. No proposal was declined; the gate is simply undecided, and
  undecided defaults to **deny**.
- **Effect on shipped work:** none — C4-G Phase 1 (deterministic compiler + UI) ships
  independently and remains fully functional with no model runtime present.

## What flips this to GO

Owner fills the status table in ADR 0011 (provider/model identity, runtime location, data
sent and corpus boundary, log retention, abuse and prompt-injection handling, cost ceiling,
outage behaviour) and sets the ADR status to _Accepted_. Until then, no remote synthesis may
be implemented, bundled or reachable from any briefing surface.

## Owner/local/provider actions

1. Owner: decide the seven fields above, or close C4-G phase 2 as complete-without-model
   (a valid outcome — the deterministic baseline is the finished product).
