# Public Change Source Decision — S+10 Evidence Change Intelligence — 2026-09-12

**Task 10 of the v3 plan. Decision: NO-GO (no runtime timeline).**

## Step 1 — Does authored, approved public change metadata exist?

**No.** The repository contains no deliberately authored, owner-approved
public change metadata:

- There is no `src/data/public-evidence-changes.ts` (or equivalent) in the
  live tree.
- Product content (the only publishable surface that could change) has an
  **empty public registry**; no public product has ever been listed, so no
  public "change" has an authorable subject yet.
- Trust/integrity surfaces are versionless by design: they state current
  posture, not a dated changelog.

## Step 2 — Invalid public change sources (explicitly rejected)

Per the v3 plan and the integrity rules, the following are **not** valid
sources for a public change timeline:

- raw Git history, commit hashes, commit dates, author metadata;
- pull-request titles, numbers, or merge timestamps;
- deployment/build timestamps, workflow runs, CI artifacts;
- anything derivable automatically rather than deliberately authored.

Rationale: those sources expose internal governance, change automatically
without an owner decision, and cannot be localized or truth-reviewed. A
timeline built from them would be activity theater — exactly what the v3
plan forbids.

## Step 3 — Consequence

- **No runtime timeline is created**: no
  `src/data/public-evidence-changes.ts`, no
  `EvidenceChangeTimeline.astro`, no client changes, no new routes.
- The Evidence Pulse capability (Task 7, shipped in #124) already covers
  _current_ freshness through authored `ReviewMetadata`; nothing in the
  live UI claims to show change history, so there is no gap or dead
  affordance.

## Step 4 — Conditions to revisit (GO criteria)

A future GO requires **all** of:

1. At least one public product (or other publishable subject) exists in the
   registry, giving changes something real to reference;
2. An owner-authored, reviewable change record format (authored date, subject
   id, change kind, localized summary) with an explicit approval step —
   authored data only, never derived from Git/CI;
3. Schema tests that reject Git/CI-derived data **before** any rendering is
   built (per the plan: "write schema tests that reject Git and CI
   derivation before implementation");
4. Evidence that a timeline improves visitor understanding rather than
   adding noise — measured, not assumed.

Until then this capability stays absent by decision, with this record as the
evidence.
