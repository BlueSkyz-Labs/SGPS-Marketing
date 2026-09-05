# Evidence — R4d comprehensive mockup upgrade (2026-09-05)

## Source

Owner-provided comprehensive R4d upgrade mockups (9 boards), archived under
`assets/`. Direction applied to the live marketing shell without inventing
public product registry entries or contact emails.

## Applied (site)

| Mockup signal                                                  | Site change                                                       |
| -------------------------------------------------------------- | ----------------------------------------------------------------- |
| Tagline **Intelligence. Elevated. Impact.** (Impact in Cobalt) | Hero H1 from `SITE.taglineLead` / `SITE.taglineAccent`            |
| Supporting copy + quiet excellence                             | `SITE.proposition` + `SITE.supporting`                            |
| Motto **Build with clarity. Scale with confidence.**           | `SITE.motto` in One house + footer                                |
| Principles Intelligence / Elevation / Trust / Impact           | `BRAND_PRINCIPLES` in One house                                   |
| Dark Ink hero + metallic mark + cobalt flare                   | `.hero-plane--ink`, mark stage flare, motion                      |
| Header **Contact us** when Act path allows                     | `emptyRegistryPrimaryCta` label; header CTA when email + products |
| Product grid (ApexAgent, Sổ Tâm, …)                            | **Not published** — empty registry remains honest                 |

## Explicitly not claimed

- Cobalt remains kit SoT `#2568FF`.
- No Solutions/Resources nav invented beyond existing Products / About / Contact.
- No public product YAML from mockup showcase cards.
- Domain `blueskyz-labs.com` not asserted as live canonical.

## Gates (this branch)

- `pnpm test:architecture` — pass (83)
- `pnpm format:check` — pass
- `pnpm lint` — pass
- `pnpm build` (+ typecheck + static export verify) — pass
- `pnpm check:client-budget` — pass
- `pnpm check:static-links` — pass
- `pnpm exec playwright test --project=chromium` — pass (33)
