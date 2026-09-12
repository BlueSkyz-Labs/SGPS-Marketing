# Evidence templates

Templates for evidence that **cannot be produced by an automated gate**: real
human sessions and red-team probes. They exist so a future session can execute
the v3.1 C9 / Human E4 protocol without re-deriving scope, and so the result
lands in a reviewable shape instead of prose.

## The honest-status rule (binding)

- **Never fabricate participants, sessions, observations, scores, or dates.**
  A template filled with invented content is worse than an empty template.
- **Default status is `NOT RUN`.** It stays `NOT RUN` until a real session or
  probe actually happened and its raw record exists.
- Automated suites, LLM simulations, screenshots, and density proxies are
  **preflight only**. They may never promote a template's status.
- `docs/evidence/2026-09-12-v3-human-e4.md` is the current protocol and its
  status is `NOT RUN`. Human E4 remains OPEN until real participant evidence
  is separately collected.
- Observations (what happened) and interpretation (why we think it happened)
  are recorded in **separate sections** and never merged.
- Quotes are verbatim or omitted — never paraphrased into a claim.
- A defect found here is filed as a bounded follow-up with its observation
  attached, not silently fixed and not silently dropped.

## Templates

| Template | Use it for | Status vocabulary |
| --- | --- | --- |
| `human-e4-session-template.md` | one participant, one locale, one session | `NOT RUN` / `RUN` / `INVALID` |
| `red-team-probe-template.md` | one adversarial probe against a claim or surface | `NOT RUN` / `DETECTED` / `REMEDIATED` / `OPEN` |

## How to use

1. Copy the template to `docs/evidence/YYYY-MM-DD-<slug>.md`. Do not edit the
   template in place — one file per session or probe ledger keeps provenance
   unambiguous.
2. Fill only fields you can source. Leave anything you cannot source as
   `NOT RECORDED` rather than guessing.
3. Set the status field to its real value. `NOT RUN` is a valid, expected
   result and requires no justification.
4. Link the raw record (transcript path, probe command, screenshot) in the
   evidence column. An unlinked claim is not evidence.

## Related authority

- Protocol and tasks: `docs/evidence/2026-09-12-v3-human-e4.md`
- Independent review expectation: `docs/evidence/2026-09-12-ui-qa-qc-redteam-audit.md`
- Structural (automated) density ceiling: `tests/architecture/experience-density.test.mjs`
  — a structural proxy only; it explicitly cannot claim comprehension.
