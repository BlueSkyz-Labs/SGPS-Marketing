# Journey & Blog: content platform, SEO/GEO program and customer-centric roadmap (2026-10-22)

**Status:** PROPOSED. Owner decisions D-1..D-9 in §10 are required before any
build card starts. Nothing in this document changes Product Truth, ADR 0011/0013
or the SGPS pin. Baseline measured at `main` `959d03f` (#660), 2026-10-22
12:20 PM GMT+7.

**Owner request (2026-10-22, paraphrased):** two site branches: (1) **Journey**,
the latest updates and articles about the BlueSkyz Labs ecosystem; (2) **Blog**,
SEO articles related to the products, where an AI researches, gathers
intelligence, writes and publishes on its own, with clear permissions / RBAC for
managing automated posts, top-tier security, and full use of the paid
Cloudflare Workers plan and the domain already bought. Plus: a current-state
review, strategy findings, a product roadmap in phases and a customer-centric
UX/UI upgrade path.

## 0. Conclusion first

1. **Journey already exists as a shell.** v11 Journal (Owner-approved
   2026-10-03) built the routes `/{lang}/journal/`, a strict schema, the release
   adapter and the navigation gate. It holds **zero posts**, is `noindex`, has no
   header link, no RSS and no release record. The fastest customer-visible win on
   this site is to fill it (J3, J4, J5), not to build a new section.
2. **Blog: yes to an AI-operated pipeline, no to autonomous publishing.** Three
   independent authorities already forbid "AI writes and publishes alone":
   v11 §7.3/§7.4 (Owner's own rule: Owner approval is the publish gate; never
   mass-generate), ADR 0013 (Option B: AI may assist authoring offline, every
   artifact is human-reviewed), and Google's scaled content abuse policy (pages
   generated "without adding value for users", applied "no matter how it's
   created"; last updated 2026-08-28). The design below keeps every AI step
   (research, draft, self-review, SEO check, PR) autonomous and keeps **one human
   click** as the publish gate. That click is the RBAC.
3. **RBAC lives in GitHub, not in a new login on the marketing site.** The site is
   an assets-only Worker with no sign-in, a strict CSP and a zero-tracking
   posture. Putting users, sessions and an admin UI on `blueskyzlabs.com` would
   add the largest attack surface this project has ever had, for a team that
   today has one approver. GitHub already provides roles (CODEOWNERS, teams,
   labels, environments, rulesets) and the `owner-approved` gate. A separate,
   Cloudflare-Access-protected **Studio** on its own hostname is the Phase-3
   option, behind its own ADR.
4. **The paid Workers plan is more than enough for Phase 3**, at roughly $5/month
   plus cents. Numbers in §8.
5. **Customer-centric priority order:** (a) prove the "living product" promise
   with real updates (Journey + release records + a latest-update signal on
   product pages), (b) close the measurement loop (Search Console, Web
   Analytics beacon), (c) only then scale content.

## 1. Measured state (what exists on `main` 959d03f)

| Area                | State                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack               | Astro 7.3.x, static output, Cloudflare Workers assets-only (`wrangler.toml`: no `main` script, `workers_dev = false`, `preview_urls = false`, observability logs persisted). 4 locales × 20 page types. Client JS budget 120 KB Brotli (current ~1.6 KB).                                                                                                                                                        |
| Security headers    | CSP `default-src 'self'`, `script-src 'self' 'inline-speculation-rules' <cf beacon>`, `connect-src 'self'`, `require-trusted-types-for 'script'`, HSTS, COOP, CORP, no framing. Guarded by `tests/architecture/security-surface.test.mjs` (build fails on `'unsafe-inline'`/`'unsafe-eval'` in `script-src`).                                                                                                    |
| Content model       | Collections `products` (5 YAML), `pages`, `showcases` (1), `journal` (**0 entries**). `journal-schema.ts`: VI+EN pairs, branches `news` and `product`, `sources` ≥1, `ownerApproval` = a PR URL, product posts need a `releaseRecord`. `src/data/releases/` does not exist yet.                                                                                                                                  |
| Journey shell (v11) | J0 runbook written (`docs/runbooks/search-console-readiness.md`; Owner execution not evidenced in `current-work.json`). J1 routes, index, noindex gate, nav gate (`journal-nav.ts`, TRU-15) built. J2 adapter `release-adapter.ts` built. **J3–J7 not started.** No RSS, no sitemap entry (by design until the first post).                                                                                      |
| AI posture          | ADR 0011: model-assisted synthesis NO-GO by default. ADR 0013: Option A (deterministic concierge) GO, Option B (build-time AI-assisted content, human-reviewed) GO, Options C/D (runtime model calls) NO-GO until Owner fills provider/runtime/logging/abuse/cost fields. `robots.txt` explicitly allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended etc. (2026-10-07 GEO bundle). No Content-Signal line. |
| Governance          | Ruleset `main-promotion-governance`: PR + `Quality Gates` + `Browser Assurance` required; protected paths need `owner-approved`. 10 CI runs per PR since #659; median run ~33–39 min (one post-shard sample).                                                                                                                                                                                                    |
| Open Owner items    | #523 Search Console + mailbox proof, #451 Web Analytics beacon, #566 served revision, #638 signed APK landing, #522 M365 evidence, Human E4, native zh review, TRU-12, P2-6, merge queue (plan 2026-10-21 §2).                                                                                                                                                                                                   |

## 2. Findings (F-01..F-10)

| #    | Finding                                                                                                                                                                                                                                                     | Why it matters to customers                                                                                      | Severity |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------- |
| F-01 | The site promises a "living, verifiable product" (C3) but publishes **no dated update anywhere**: Journal empty, no release record, product pages show stage "Beta" with no "last changed" signal.                                                          | A visitor cannot tell whether the products are alive. Trust decays with silence.                                 | High     |
| F-02 | The measurement loop is open: Search Console execution not evidenced (#523), Web Analytics beacon absent on 2026-10-18 (#451). Any SEO program started now cannot be evaluated.                                                                             | Content decisions would be made blind; v11 J7 (90-day review) cannot run.                                        | High     |
| F-03 | The Journey vs Blog split the Owner describes maps onto v11's `news`/`product` branches plus the **topic posts** v11 folded into `news`. Keeping topic/SEO posts inside `news` would blur the two intents the Owner now wants separate.                     | Readers of "what's new" and readers of "how do I solve X" are different people with different entry points.      | Medium   |
| F-04 | Autonomous AI publishing is contradicted by v11 §7, ADR 0013 and Google's scaled content abuse policy (2026-08-28). The risk is domain-wide: a spam action would also hit the product and trust pages, not only the blog.                                   | One bad month of auto-posts could remove the whole site from search.                                             | High     |
| F-05 | The site has **no author identity** surface. Google's AI-features guide (2025-12-10) and its quality guidance reward first-party experience; a blog without a named, accountable author reads as third-party content.                                       | E-E-A-T and the site-reputation policy both depend on first-party accountability.                                | Medium   |
| F-06 | `robots.txt` welcomes AI crawlers but states no **Content-Signal** preference; Cloudflare's Content Signals Policy (2025-09-24) lets the site declare `search`, `ai-input`, `ai-train` separately. Signals are not enforced, so this is a policy statement. | The Owner has not decided whether the brand's content may train models. Silence is a decision by default.        | Low      |
| F-07 | Any new authenticated surface on `blueskyzlabs.com` collides with the CSP guard, the zero-tracking posture, the persisted invocation logs (ADR 0013 fact 4) and the "no sign-in" hard rule.                                                                 | A login on the brand origin would be the first stateful, credential-bearing surface; the blast radius is global. | High     |
| F-08 | The paid Workers plan is idle: no Worker script, no KV/D1/Queues/Workflows/AI bindings. Its value is latent until there is a workload that needs a runtime.                                                                                                 | Paying for capacity is fine; building a runtime to justify it is not (AGENTS rule 7).                            | Info     |
| F-09 | zh and zh-Hant are live but not native-reviewed; v11 chose VI+EN only for posts. A Blog in four locales would multiply unreviewed machine text.                                                                                                             | Unreviewed text in a reader's own language is a brand risk, not a reach gain.                                    | Medium   |
| F-10 | The next-waves plan (2026-10-21) still has W1–W6 open, including the visual baseline refresh and the shard measurement. New feature work queued ahead of it would re-create the CI contention measured this week.                                           | Delivery throughput is the ceiling on everything below.                                                          | Medium   |

## 3. Constraints that bind this design

- **Google spam policies** (developers.google.com, last updated 2026-08-28):
  scaled content abuse = "many pages generated for the primary purpose of
  manipulating search rankings and not helping users … no matter how it's
  created"; examples include "using generative AI tools … to generate many pages
  without adding value for users". The site reputation policy targets third-party
  content hosted mainly to borrow the host's ranking signals.
- **Google AI features guide** (last updated 2025-12-10): to appear in AI
  Overviews / AI Mode a page must be indexed and snippet-eligible; "no additional
  technical requirements", no special schema, no new machine-readable files.
- **v11 §7** (Owner, 2026-10-03): facts only from sources; no release without a
  record; Owner approval is the publish gate; no filler; VI+EN pairing; real dates.
- **ADR 0011 / 0013**: no runtime model call on the site without the Owner-filled
  fields; build-time AI assistance with human review is GO.
- **AGENTS.md hard rules**: agents never author brand copy as fact, never invent
  claims; no sign-in, no tracking beyond Cloudflare Web Analytics; CC-3 never
  ranks customer convenience above security, privacy or legal constraints.
- **SGPS DEC-003** (product opportunity admission): the Studio (§6 Phase 3) is a
  new internal product and goes through admission, not through this spec.

## 4. Target information architecture

| Branch      | Purpose                                                                                                                                                                | Collection / path                                                                   | Languages     | Publish gate                                                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Journey** | What BlueSkyz Labs and its products are doing: launches, milestones, real product releases, how-we-build, security practice.                                           | existing `journal` collection, `/{lang}/journal/` (Owner chose the path 2026-10-03) | VI + EN       | v11 §5/§7: one PR per post, Owner approval comment, `ownerApproval` URL in frontmatter, release record for product posts |
| **Blog**    | Evergreen, search-intent articles that help a landlord, a private journaler or an SMB decide or do something, and that link to the product where it genuinely applies. | new `blog` collection, `/{lang}/blog/<slug>/`                                       | VI + EN (D-3) | same mechanics as Journey plus the Blog schema fields in §5.2; a monthly cap (D-4)                                       |

Display names are an Owner decision (D-2). The URL `/journal/` stays; renaming
the label to "Journey" / "Hành trình" is a copy change, not a route change.

Cross-links: a Journey product post links to the product page and the release
record; a Blog article links to at most one product CTA and never to a page the
product does not have. The product page gains a "Latest update" line fed from
the newest Journey product post (v11 J6 / C3-F Task 4).

## 5. Blog: the AI-operated editorial pipeline

### 5.1 Principle

Autonomy everywhere **except the last step**. The AI may discover, research,
rank, draft, translate, self-review, run SEO checks and open the PR. A human with
the Publisher role merges. This is the only design that satisfies v11 §7.3, ADR
0013 Option B and the spam policy at the same time, and it costs nothing to run.

### 5.2 Blog entry contract (new `src/lib/blog-schema.ts`)

Required beyond the Journal fields: `author` (a real person from a small
`authors` registry with role and bio; never an AI persona), `reviewedBy`,
`aiAssisted: true|false` (rendered as a visible disclosure line), `intent`
(`learn | compare | do | decide`), `audience` (`landlord | journaler | smb`),
`sources` ≥2 with at least one primary source, `lastReviewed`, `relatedProduct`
(optional, must exist in `products`), `canonicalPair` (the VI/EN twin). Guards:
no claims about product capabilities that the product registry does not carry
(reuse the existing claim/glossary gates), no pricing, no testimonials, no
"best"/"#1" superlatives, no invented statistics (every number has a source).

### 5.3 Pipeline stages (Phase B1 = agent-run, no site runtime)

| Stage       | What the agent does                                                                                                                                                               | Gate / evidence                                                         |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Discover    | Weekly: read Search Console queries (once #523 is done), product support themes, competitor and regulation news; propose ≤5 topics with intent, audience and a source list.       | Topic proposal as an issue; Editor picks (or auto-pick top 1 under D-4) |
| Research    | Collect primary sources (laws, official docs, vendor pages), label month/year, search for contradiction, record what could not be verified.                                       | Research note stored in the PR body                                     |
| Draft       | VI first, EN pair; answer-first structure; one product mention max; disclosure line.                                                                                              | Schema validation, pairing guard, claim gate, word cap                  |
| Self-review | A separate reviewer lane (maker ≠ judge, OPERATING_RULES O4) checks facts against sources, flags unsupported sentences, checks reading level and duplication with existing posts. | Review report in PR; unsupported sentences are cut, not softened        |
| SEO/GEO     | Title/description length, heading outline, internal links, `Article` JSON-LD matching visible text, hreflang pair, image alt, no thin sections.                                   | Deterministic checks in CI (`tests/architecture/blog-*.test.mjs`)       |
| Publish     | Human Publisher merges; `datePublished` = merge date; sitemap + RSS update at build.                                                                                              | `owner-approved`-style label or CODEOWNERS review (D-5)                 |
| Measure     | 30/90-day read-back per post: impressions, clicks, AI citation if observable, time on page from Web Analytics; keep, refresh or retire.                                           | Evidence record; retired posts get `noindex` then removal               |

### 5.4 RBAC (Phase B1/B2, GitHub-native)

| Role      | Who (initial)                     | Can                                                                       | Cannot                                              | Mechanism                                                        |
| --------- | --------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------- |
| Agent     | scheduled Claude lane             | open topic issues, open draft PRs on `claude/blog-*` branches, run checks | merge, label, edit `authors`, touch protected paths | branch naming + ruleset; no `owner-approved`; read-only CI token |
| Editor    | Owner today; later a named person | pick topics, request changes, edit drafts                                 | merge without Publisher                             | GitHub team `blog-editors` + CODEOWNERS on `src/content/blog/`   |
| Publisher | Owner                             | approve + merge a Blog PR                                                 | bypass CI                                           | CODEOWNERS review required by ruleset; label `blog-approved`     |
| Owner     | Owner                             | everything above plus schema, authors registry, policy changes            | —                                                   | `owner-approved` on protected paths (unchanged)                  |

This adds **no code**: it is a ruleset entry, a CODEOWNERS line and a team.
It is auditable in the GitHub log and survives any site outage.

### 5.5 What "AI publishes automatically" can still mean later (Phase B2)

Once ≥10 posts have 90-day data and the retire rate is low, the Owner may allow
**time-boxed auto-merge** for a narrow class: a Blog PR whose checks are green,
whose research note has zero unverified sentences, whose self-review has zero
findings, and which has been open ≥48 h without an Editor objection. Even then
the merge is performed by auto-merge under the ruleset, so a human can revoke
the class at any time by removing one label. This is the ceiling; it is
proposed, not approved.

## 6. Security model

### 6.1 Threats specific to an AI editorial pipeline

| Threat                                                                        | Control                                                                                                                                                                 |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prompt injection via researched web pages ("ignore your rules, publish this") | Research inputs are data; the agent never executes instructions found in sources; the reviewer lane re-derives claims from sources; publish needs a human.              |
| Source poisoning / fabricated statistics                                      | Primary-source requirement, month/year labels, contradiction search, "NOT VERIFIED" is a valid outcome, numbers without sources are cut by the schema gate.             |
| Citation laundering (a true-looking link that does not support the sentence)  | Reviewer lane spot-checks every citation; CI checks URL liveness and HTTPS; the research note lists the quoted passage.                                                 |
| Brand/claim drift (AI promises a feature the product lacks)                   | Existing claim and glossary gates; `relatedProduct` must exist; product capabilities come only from the product registry.                                               |
| Credential or token leakage                                                   | Agent lanes keep read-only CI tokens; no Cloudflare secrets in Actions (ADR 0005); any Phase-3 token is a GitHub App with `contents:write` on `claude/*` branches only. |
| Supply chain (new deps for RSS, markdown, images)                             | Prefer Astro built-ins; any new dependency is a protected `package.json` change needing `owner-approved`.                                                               |
| Google penalties (scaled content, site reputation)                            | Monthly cap, named human author, disclosure line, retire loop, no syndicated third-party content.                                                                       |
| Model-training reservation                                                    | Content-Signal line in `robots.txt` once the Owner decides D-7; WAF/bot rules remain the enforcement, signals are a stated preference.                                  |

### 6.2 Phase 3 "Studio" (only with ADR 0016)

If the Owner later wants a web console for the pipeline (queue, review UI,
scheduling, metrics), build it as a **separate Worker on its own hostname**
(for example `studio.blueskyzlabs.com`), never inside the marketing Worker:

- Access: Cloudflare Access in front of every route, identity from the M365
  tenant once #522 proves it; service tokens for the agent; Access free tier
  covers small teams (vendor page states a free plan for teams under 50 users;
  not re-verified on the pricing page this session).
- State: D1 for queue/review state, R2 for draft images, KV for config, Queues
  for stage hand-off, Workflows for the multi-step pipeline with retries, Cron
  Triggers for the weekly discovery run, Workers AI via AI Gateway with spend
  caps for drafting and translation, Turnstile on any form.
- Publishing path is unchanged: the Studio opens a PR through a least-privilege
  GitHub App; the marketing site stays static and is still merged by a human.
- Logging: invocation logs for the Studio must not persist prompt bodies (ADR
  0013 fact 4 applies verbatim); kill switch documented.
- This is a new internal product: SGPS DEC-003 admission, RCR treatment and an
  ADR with the 0011 fields filled.

## 7. SEO / GEO program (what actually moves ranking here)

1. **Prerequisite:** Search Console verified and sitemap submitted (J0, #523).
   Without it, every later step is unmeasurable.
2. **Technical base is already strong**: static HTML, strict CSP, canonical +
   hreflang + JSON-LD verified in production (2026-10-18 read-back), Lighthouse
   in CI, AI crawlers allowed.
3. **Add at first post:** RSS/Atom per language, `Article`/`BlogPosting` JSON-LD
   that mirrors visible text, `dateModified` honesty (v11 §7.6), author page.
4. **Content rules that match Google's guidance:** answer-first paragraphs,
   first-party experience (real screenshots, real workflows), consistent entity
   naming ("BlueSkyz Labs", "Sổ Trọ"), internal links from product pages to
   relevant articles and back, refresh cadence instead of volume.
5. **Not required, do not spend on:** `llms.txt`, "AI-specific" markup,
   IndexNow for Google (Google does not consume it; NOT VERIFIED this session
   for Bing's current status), keyword-stuffed topic clusters.
6. **Measure reference rate, not only clicks:** once posts exist, record whether
   AI answers cite the site for its own product names (manual monthly probe is
   enough at this size).

## 8. FinOps on the paid Cloudflare plan (vendor pages read 2026-10-22)

| Resource (Workers Paid, $5/mo) | Included                                             | Phase B1 use | Phase 3 Studio estimate                                                                                                                                                                               |
| ------------------------------ | ---------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Requests / CPU                 | 10 M requests, 30 M CPU-ms                           | 0            | a few thousand requests/month                                                                                                                                                                         |
| Cron Triggers                  | 250 per account; CPU up to 5 min per invocation      | 0            | 1 weekly discovery + 1 daily measure                                                                                                                                                                  |
| Workflows                      | 500 k steps, 1 GB-month storage (shared request/CPU) | 0            | ≤ 8 posts × ~10 steps = ~80 steps/month                                                                                                                                                               |
| Queues                         | 1 M operations                                       | 0            | negligible                                                                                                                                                                                            |
| D1                             | 25 B rows read, 50 M rows written, 5 GB              | 0            | negligible                                                                                                                                                                                            |
| KV                             | 10 M reads, 1 M writes, 1 GB                         | 0            | negligible                                                                                                                                                                                            |
| Workers AI                     | 10 000 neurons/day free; $0.011 per 1 000 beyond     | 0            | Llama 3.3 70B: 26 668 neurons/M input, 204 805/M output tokens → one 1 500-token draft ≈ 360 neurons; a 50 k-token research digest ≈ 1 300 neurons. Inside the free daily allocation at this cadence. |
| Zero Trust / Access            | free plan for small teams (vendor page; see §6.2)    | 0            | $0 for ≤ 50 users                                                                                                                                                                                     |

Expected monthly cost: **$5 flat** for B1/B2 (already paid, unused), **$5 + <$1**
for Phase 3 at ≤8 posts/month. The real cost is human review time, which the cap
in D-4 bounds.

## 9. Roadmap (phases; each phase is its own plan with task cards)

| Phase | Name                                    | Scope                                                                                                                                                                                                                                                                                                                           | Exit evidence                                                                                                | Owner gates                                |
| ----- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| P0    | Finish the open delivery wave           | Next-waves plan W1–W6 (close audit wave, shard measurement, visual baseline refresh, C3-G draft, #290 ledger, hygiene).                                                                                                                                                                                                         | Plan §0 rows all MERGED; CI median recorded                                                                  | W3 label                                   |
| P1    | **Journey goes live**                   | J0 Search Console executed by the Owner; first release record `src/data/releases/sotro/<version>.json` (Owner confirms it is public); J3 launch post, J4 first product post, J5 first topic post (VI+EN); RSS; `Article` JSON-LD; author registry; header nav appears via the existing gate; product page "Latest update" line. | 3 posts merged with Owner approval comments; production read-back in en/vi; Search Console shows the sitemap | release record, 3 post approvals, D-1, D-2 |
| P2    | **Blog B1 (assisted pipeline)**         | `blog` collection + schema + guards + negative proofs; CODEOWNERS/team/label RBAC; weekly scheduled discovery lane; first 4 articles through the full pipeline; measurement template.                                                                                                                                           | 4 articles merged; every PR carries research note + review report; zero unverified sentences published       | D-3, D-4, D-5, D-7                         |
| P3    | **Experience depth (customer-centric)** | P2-6 typography decision; BB-02 real Sổ Trọ mobile UI; Spatial halo GO/NO-GO; native zh/zh-Hant review or demotion; Human E4 session; Contact/About journey re-audit after Journey exists (CC-1 whole-journey check).                                                                                                           | Evidence records per item; CC-2 degradations stated                                                          | Human E4, zh reviewer                      |
| P4    | **Blog B2 + Studio decision**           | 90-day review of P2 (J7 pattern); decide the auto-merge class (§5.5); ADR 0016 for the Studio if the Owner wants a console; APK landing #638 when a signed artifact exists.                                                                                                                                                     | Review record; ADR status; DEC-003 admission for the Studio                                                  | D-6, D-8, D-9                              |

Durations are not estimated here: this project's throughput is bounded by CI
and Owner review slots, and W2 is still measuring the former.

## 10. Owner decisions required

| ID  | Question                                                                                       | Recommendation                                                                                                  |
| --- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| D-1 | Confirm the Journey = existing Journal (news + product) mapping, no new route.                 | Yes.                                                                                                            |
| D-2 | Display label: keep "Journal / Nhật ký" or rename to "Journey / Hành trình" (route unchanged). | Owner's call; it is brand copy and the agent does not author it.                                                |
| D-3 | Blog languages: VI + EN only, or VI first with EN later.                                       | VI + EN pairs, same as Journey; zh/zh-Hant excluded until a native reviewer exists.                             |
| D-4 | Monthly cap for Blog articles.                                                                 | 4 per month in P2, 8 at most later. A cap is the anti-scaled-content control.                                   |
| D-5 | Publisher mechanism: `blog-approved` label, or CODEOWNERS review on `src/content/blog/`.       | CODEOWNERS review (ruleset-enforced, survives label mistakes).                                                  |
| D-6 | Is a time-boxed auto-merge class (§5.5) ever acceptable?                                       | Defer to P4 with data; default no.                                                                              |
| D-7 | Content-Signal preference: `search=yes` certain; `ai-input` and `ai-train` yes/no.             | `search=yes, ai-input=yes, ai-train=no` is the common publisher stance; the Owner decides the brand's position. |
| D-8 | Build a Studio console (Phase 3) or stay GitHub-native.                                        | Stay GitHub-native until ≥10 posts and a second human editor exist.                                             |
| D-9 | Who is the named author on Blog articles.                                                      | A real person with a bio; required before P2 starts.                                                            |

## 11. Red-team of this proposal (weakest points)

1. **It slows down what the Owner asked for.** The Owner asked for an AI that
   publishes alone; this design keeps a human click. If the Owner overrides,
   the design still holds everywhere except §5.5, but the Google risk in F-04
   becomes the Owner's accepted residual risk (RCR R3/R4; needs explicit
   acceptance).
2. **The human bottleneck is real.** With one approver, 4 posts/month plus
   Journey posts is 6–8 review slots a month. If they are not available, the
   pipeline idles; the plan prefers idling over filler, by the Owner's own rule.
3. **SEO effect is unproven for this domain.** The site is young; there is no
   Search Console history. The first 90 days may show no traffic at all. The
   measurement loop exists precisely so the program can be stopped cheaply.
4. **Vendor numbers move.** Cloudflare allowances and Google policy text were
   read on 2026-10-22; a later change invalidates §8 and §3, not the structure.
5. **Author identity depends on the Owner's willingness to be public.** F-05
   assumes a named person; a pseudonymous or company-only byline weakens the
   E-E-A-T argument.

## 12. Sources read this session (month/year labelled)

- Google Search Central, Spam policies (updated 2026-08): https://developers.google.com/search/docs/essentials/spam-policies
- Google Search Central, AI features and your website (updated 2025-12): https://developers.google.com/search/docs/appearance/ai-features
- Cloudflare Workers pricing (read 2026-10): https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Workers limits (read 2026-10): https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare Workers AI pricing (read 2026-10): https://developers.cloudflare.com/workers-ai/platform/pricing/
- Cloudflare Zero Trust seat management (read 2026-10): https://developers.cloudflare.com/cloudflare-one/identity/users/seat-management/
- Cloudflare Access product page, free plan for teams under 50 users (search summary, not re-verified on page): https://www.cloudflare.com/en-gb/sase/products/access/
- Cloudflare blog, Content Signals Policy (2025-09): https://blog.cloudflare.com/content-signals-policy/
- Cloudflare docs, managed robots.txt / Content Signals (read 2026-10): https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/index.md
- Cloudflare AI Crawl Control changelog (read 2026-10): https://developers.cloudflare.com/ai-audit/changelog
- Search Engine Land on Content Signals (2025-09): https://searchengineland.com/cloudflare-content-signals-462538
- Repository truth: `docs/superpowers/plans/2026-10-03-v11-journal-news-and-product-updates.md`, `docs/decisions/0011-*.md`, `docs/decisions/0013-*.md`, `src/lib/journal-schema.ts`, `src/lib/journal-nav.ts`, `src/pages/robots.txt.ts`, `public/_headers`, `wrangler.toml`, `scripts/check-merge-policy.mjs`, `docs/current-work.json` at `959d03f`.
