# External design skills review: taste-skill and ui-ux-pro-max (2026-10-23)

Owner request 2026-10-23: install and apply two external Agent Skills for the
experience wave. Reviewed under SGPS `external-reference-review` (AGENTS rule 43).

## Provenance

| Source                                                                                               | Revision reviewed                                       | License |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------- |
| https://github.com/Leonxlnx/taste-skill (`skills/taste-skill`, install name `design-taste-frontend`) | `6010f91a9935f1c167dfc500fb1a475681892e6b` (2026-10-20) | MIT     |
| https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (`.claude/skills/ui-ux-pro-max`, v2.15.0)    | `d14efff8ed1faa4187f004f79926f428c8074ec7` (2026-10-23) | MIT     |

## Surfaces inspected

- taste-skill: `SKILL.md`, `references/*.md`, `scripts/*.mjs`, `install.sh`.
  `scripts/assets.mjs` fetches openly licensed images from public image
  libraries over the network and writes them into the project; `draw.mjs`
  suggests picsum.photos stock URLs and writes a history file under the home
  directory; `inspect.mjs` runs a local headless browser. No hooks, no
  install-time execution.
- ui-ux-pro-max: `SKILL.md`, `references/quick-reference.md`, `scripts/*.py`.
  The search scripts read local CSV/JSON data; no network calls outside tests.
  Its "persist design system" step writes a `design-system/` folder into the
  project. No hooks. The skill states that its results are recommendations
  that never override the user or repository rules.

## Disposition

Execution posture: `REFERENCE_ONLY`. Installing the skills into the agent
configuration was refused by the session's permission policy; agents read the
reviewed copies as advisory text instead.

| Concept                                                                                                   | Class  | Boundary                                                                                    |
| --------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| taste-skill "tells" and critique checklist (generic/templated look, rhythm, type scale, motion restraint) | ADAPT  | audit lens only; Brand Kit v4 tokens, Product Truth and the experience contract win         |
| ui-ux-pro-max priority table (accessibility, touch, performance, layout, type, colour, motion)            | ADAPT  | audit lens only; WCAG and repo budgets are the gates                                        |
| taste-skill image fetching, picsum/stock photos, new font or palette directions                           | REJECT | AGENTS hard rules: no invented photography or imagery; Brand Kit v4 is the visual authority |
| ui-ux-pro-max `design-system/` persistence, style/palette/font catalogues                                 | REJECT | would create a second design truth beside Brand Kit v4                                      |
| running either skill's scripts in CI or the build                                                         | REJECT | no new executable dependency                                                                |

## Abstention and precedence checks

- Positive: an audit of spacing rhythm on `/vi/products/sotro/` uses both checklists.
- Negative: a request for product copy or a testimonial does not trigger either skill.
- Conflict: the skill suggests a new display font; Brand Kit v4 type tokens win.
- Evidence: a finding produced through either lens is a hypothesis until the
  repo gates (visual, axe, Lighthouse) and independent review confirm it.

## Re-audit and removal

Re-audit before any executable use or when a new upstream release changes
`SKILL.md` or scripts. Removal needs no code change: the skills are not
installed in the repository or the build.
