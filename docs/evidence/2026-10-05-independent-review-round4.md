# Independent review round 4 — newest main deltas (2026-10-05)

One read-only review (security/correctness) covered the deltas merged after
round 3: the C3-E fold (`9d7bc4f9`), the merge-policy-before-package-manager
fix (#462), the Playwright OCI-digest pin (#374), and the docs merges
(#516–#518). Every claim below was reproduced by execution, including
reverse mutations; the review's own scratch tree was restored byte-identical
and the repository was never written.

## Verified PASS (with falsification where it matters)

- **The fold is search-text-only.** Corpus text reaches only the `data-search`
  attribute; stripped-HTML visible text is unchanged; a hostile payload
  authored into a product description stayed inert (real Chromium: 0 inline
  handlers, 0 injected nodes, 0 dialogs; the attribute value is escaped).
- **The fold drops unmatched records.** A record for an invented surface
  produced no item, no link and no visible text in any locale (Map lookup,
  never enumeration).
- **The fold leaves no dangling references** (only prose mentions in
  historical docs + the intentional negative e2e assertion), and the rewritten
  spec's same-origin coverage moved to the corpus guard + `s-plus-command`
  spec rather than being lost.
- **#462's ordering fix holds** (reverse mutation: moving package-manager
  activation before the policy step = RED; restore = GREEN), the policy is
  read from the base commit (self-relaxation proven blocked), and malformed
  label input fails closed.
- **#374's pin holds** for the browser shards (four mutations RED→GREEN;
  digest is immutable), with honest disclosure that no publisher
  signature/SLSA attestation is verified.
- **No new external origin, sink or secret** entered main in any of the six
  commits (added-line scans; the only added URLs are doc references in an
  unpublished draft; the only "secret" hit is a comment saying it carries
  none).

## Gaps found and remediated in this PR

1. **Supply-chain config surfaces were unprotected** (pre-existing): a
   registry-redirect `.npmrc` auto-passed the merge policy while an
   equivalent `package.json` change was held (proved with a real commit
   pair). Fixed: `.npmrc`, `.yarnrc.yml`, `package-lock.json`, `yarn.lock`
   are now PROTECTED_PATHS; `pnpm-lock.yaml` intentionally stays automatic
   per the standing lockfile-flow policy.
2. **The visual-gate job still downloaded browsers** on a plain runner with
   a retry loop, outside the digest-pin audit (pre-existing; #374 pinned the
   four engine shards only). Fixed: the visual gate now uses the same
   digest-pinned Playwright image, launch-tests the bundled runtime, and the
   browser-assurance matrix audits it — with a negative proof that an
   unpinned visual gate is caught.
3. **The fold's corpus feed was locale-blind**: the English-only top-level
   description entered the VI/ZH/ZH-HANT search text (attribute-only,
   invisible — wrong-language search matching, no security impact). Fixed:
   the feed prefers each locale's own `shortDescription`, pinned by a guard.

## Not tested (explicit)

- Full `pnpm test:e2e` was not run by the review; the rewritten spec was
  verified by DOM-level simulation, not Playwright execution.
- The MCR image digest was not pulled/verified against Microsoft's manifest
  (the digest-pin property itself is verified statically).
- Live GH branch-protection/required-check configuration was not read via
  the API (inferred from the workflow + QA strategy).
- The `.npmrc` gap was not exercised against a live malicious install (the
  gate's auto-pass was proven; the fetch was not).
- The visual-gate's new pin is verified statically + by the extended guard;
  its first CI run is the runtime proof.
