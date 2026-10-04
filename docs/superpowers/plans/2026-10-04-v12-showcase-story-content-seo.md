# v12: Showcase story, customer-led content and SEO (SGPS-Marketing)

**Status:** **APPROVED — ACTIVE.**

**Date:** 2026-10-04 (GMT+7).

**Baseline:** `main@aaf091a`.

## Approval

The Owner directed this round on 2026-10-04. The direction, summarised:

- Land every remaining PR and leave `main` clean.
- Then upgrade the whole site on a plan → do → check → verify → repeat loop.
- Goals:
  - the portfolio's DNA reads at first glance;
  - copy with professional marketing polish, written from the customer's side;
  - best-practice SEO;
  - a feature showcase that is no longer thin, with a wow factor for real prospects;
  - seamless, smooth scroll-driven transitions between features and highlights.

The direction also asked for critical thinking and for the copy to take the customer's position.

The Owner chose "Làm trọn mockup" and "Giữ xanh" for the calm-chrome round (PR on `claude/marketing-project-audit-623e4t-quiet-luxury`).

**The delegation covers** routine reversible work inside this plan.

**It does not cover:**

- the `owner-approved` label;
- product facts, screenshots, quotes or metrics that the repository does not hold;
- legal prose;
- lifting Cloudflare Access;
- Search Console access.

**Relationship to other plans:**

- v9 §8 and v10 §7 apply unchanged and stay mandatory.
- v11 (Journal) stays queued.
- v12 does not publish posts.

> **MANDATORY FOR EVERY AGENT.** Before any action, read v9 §8, then v10 §7, then §5 of this file, then your card in §6.

## 1. Research basis

GRES QUICK. Every source below was read in this session on 2026-10-04.

| Source                                                                                                              | What we take                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [Linear: How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui) (2024-03-28)      | Reduce visual noise. Keep alignment strict. Use contrast and hierarchy, not chrome.                                         |
| [Linear changelog: UI refresh](https://linear.app/changelog/2026-03-12-ui-refresh) (2026-03-12)                     | Dimmer navigation so content stands out. Consistent headers. "a calmer, more consistent interface".                         |
| [Apple HIG: Motion](https://developer.apple.com/design/human-interface-guidelines/motion)                           | Motion is purposeful and brief. Avoid gratuitous motion. Honour Reduce Motion.                                              |
| [Apple HIG: Typography](https://developer.apple.com/design/human-interface-guidelines/typography)                   | Hierarchy comes from text styles.                                                                                           |
| [NN/g: Aesthetic and Minimalist Design](https://www.nngroup.com/articles/aesthetic-minimalist-design/) (2021-01-24) | Remove noise but keep every necessary element. Too minimal hurts usability. "Clarity will always win over visual flourish." |
| [Vercel Geist](https://vercel.com/geist)                                                                            | One type family, a precise grid and functional motion.                                                                      |

**Third-party style write-ups** (Stripe's light display weight and similar) were used only as discovery. They are not cited as authority.

**The main weakness of this basis:** these are desk sources (E0). The real test is Human E4, which is still an Owner step (v9 F3).

## 2. Measured baseline (2026-10-04)

**Showcase truth already in the repo.** These are the facts, captions and media the story and copy may use:

| Asset                              | What it holds                                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `src/content/showcases/sotro.yaml` | 18 real screens captured from `sotro@b2b3388` with synthetic data, each with a title, caption and alt text in en/vi/zh/zh-hant. |
| Intro video                        | 49.5 s, silent, with 4 caption tracks.                                                                                          |
| `src/content/products/sotro.yaml`  | 2 jobs and 3 capabilities, plus their localized copy.                                                                           |

**Gaps:**

- **The showcase is thin.** The product page shows a static grid of screens. Nothing tells the story of a landlord's month.
- **The copy is product-centric.** Home and product pages describe what the product is, not the visitor's problem and outcome.
- **SEO is not audited.** We have not yet checked per-route titles and descriptions, structured data, OG coverage and the Lighthouse SEO category.

## 3. Workstreams

| ID     | Workstream                                                                                                                                                       | Lane                         | Protected?             |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------- |
| **W1** | Land the open PRs one at a time: #500 → #502 → #505 → calm-chrome. Regenerate visual baselines after each merge. Triage the rest (§4). Clean up merged branches. | Orchestrator                 | Labels exist           |
| **W2** | **Feature Story**: a chaptered, scroll-driven Sổ Trọ story (§6 S1)                                                                                               | Implementer A                | Yes (tests, baselines) |
| **W3** | **Customer-led content and SEO** (§6 S2)                                                                                                                         | Implementer B                | Yes (tests, baselines) |
| **W4** | **Independent verification** of every W2/W3 head: review, screenshots, a11y and performance, then iterate                                                        | Reviewer lane + orchestrator | No                     |

**Landing order:** calm-chrome → W3 → W2. Each lane rebases on the previous merge. The visual baselines are regenerated per PR on CI actuals, after reviewing the diff bands.

## 4. Open-PR dispositions (2026-10-04)

| PR                                 | State                                                        | Disposition                                                                                        |
| ---------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| #500, #502, #505                   | Labelled                                                     | W1 lands them in order.                                                                            |
| #499 (local agent, C3-E concierge) | Red: v8 trust-page budgets (word cap, CTA cap on `/verify/`) | Diagnosis is posted on the PR. The fix is a design decision for the C3-E lane. Not taken over.     |
| #488 (legal drafts)                | Green, draft                                                 | Waits for the Owner's facts (legal identity). Never merged with invented legal prose.              |
| #462, #374 (security CI)           | Stale, red                                                   | They predate the ruleset changes. Their owners re-cut them. v9 O-3 keeps #374 until after go-live. |

## 5. Agent contract additions (MANDATORY, on top of v9 §8 and v10 §7)

1. **Truth only.**
   - Every visible claim, caption, screen or number traces to `src/content/**` or `src/data/claims.ts`.
   - Marketing copy may reframe a registered fact as a customer outcome. It may never add a capability, metric, testimonial, price or comparison.
   - If a needed fact is missing, record it as `BLOCKED_OWNER_FACT`.
2. **Customer first.**
   - Each section answers, in order: whose problem, what changes for them, how they can check it.
   - Read every headline as a Vietnamese landlord would, and again as an international visitor would.
   - Remove anything that serves us rather than them.
3. **Motion grammar.**
   - Use native CSS scroll-driven animations (`animation-timeline: view()/scroll()`) inside `@supports` and `prefers-reduced-motion: no-preference`. The CSS default is the final, readable state.
   - No scroll hijacking and no scroll-jacked snapping of the main page.
   - No new JS unless a measured need exists, and then within the client budget.
   - Transitions are brief and purposeful (Apple HIG).
4. **Banned phrases.**
   - The `ui-inventory` banned list applies: never write "Quiet luxury" in source. This round is named "calm-chrome" in code.
   - Never write certification wording ("certified", "audited", "guaranteed", "compliant").
5. **Languages.**
   - The orchestrator reviews all VI and EN copy.
   - zh and zh-hant copy is machine-assisted and marked `NOT VERIFIED (native review pending)`.

## 6. Task cards

### S1: Feature Story (W2)

**Goal:** turn the Sổ Trọ product page showcase into a story of a landlord's month. Each chapter is one job, with real screens.

**Structure:**

- A sticky device stage holds the phone screen.
- As the visitor scrolls through chapters (Today → Meter readings → Collect rent → Receipts → Reminders, exact set from `sotro.yaml` screens), the stage cross-fades to that chapter's screen.
- The chapter copy comes from the screen title and caption plus the matching capability.
- Each chapter is a real `<section>` with a heading, so the content works without JS or CSS animation and stays in a logical reading order.

**The home page** gets a 3-chapter teaser that links into the story.

**Accessibility and fallbacks:**

- Under reduced motion, unsupported engines and no-JS: screens sit inline, one per chapter.
- Images are lazy except the first, and keep explicit width and height (no CLS).

**Guards:**

- The story's screens and captions come only from the showcase registry. Negative proof: an unknown screen id fails.
- The animation stays inside the motion and `@supports` gate. Negative proof: an ungated animation fails.
- Each chapter has a heading.
- The client JS budget does not grow.

**Done when:**

- Gates are green and screenshots pass review (1440 and 390, light and dark).
- Lighthouse on the product route is no worse than main.

**S1 amendment (recorded by the orchestrator, 2026-10-04):**

- The story is a deliberate scroll narrative, so the v8 §5 page budget changes for Sổ Trọ.
- At 1440 × 900 the total page cap becomes `5000 + (chapters + 1.5) × 900` px.
- The page outside the story keeps the 5000 px cap. The story's own runway is capped at `(chapters + 1.5) × 900` px.
- Guard: `tests/e2e/v8-w3-product-pages.spec.ts`, in both motion modes.

### S2: Customer-led content and SEO (W3)

**Content:**

- Rewrite the home hero support line, the flagship act copy and the product page lead in VI and EN, as problem → outcome → proof. Use only registered facts.
- Keep the hero H1 wording unless a clear customer gain exists. The H1 is guarded (`c3-editorial-typography`) and is an Owner-decided promise.
- Translate to zh and zh-hant and flag them for native review.

**SEO:**

- **Audit:** per-route `<title>` and meta description length and uniqueness (all locales), canonical, hreflang, OG and Twitter images, and robots/sitemap. Run Lighthouse SEO on 4 routes.
- **Structured data:**
  - `Organization` and `WebSite` site-wide.
  - `SoftwareApplication` for Sổ Trọ: name, `applicationCategory`, `operatingSystem` from the registry, and `offers` omitted. Never a rating, review or price.
  - `BreadcrumbList` on product pages.
- **Guard:** JSON-LD is valid and built only from registry fields. Negative proofs: a `review` or `aggregateRating` key fails, and a duplicate title fails.

**Done when:**

- Gates are green and Lighthouse SEO is 100 on the 4 routes.
- Title and description uniqueness passes in every locale.
- The orchestrator has signed off the VI and EN copy.

## 7. PDCA loop

Each round runs these steps:

1. **Plan:** a card with acceptance criteria.
2. **Do:** the lane implements and pushes.
3. **Check:** gates and CI on the exact head.
4. **Verify:** an independent reviewer and orchestrator screenshots, read as a customer.
5. **Repeat:** fix the findings, then re-verify.

The round ends when the acceptance criteria are met on main and the convergence audit finds no approved executable gap.

**After v12, the remaining Owner steps:**

- lift Cloudflare Access, which starts the T3 production smoke;
- Human E4;
- native zh review;
- the RUM provider.
