# UI QA/QC + Audit + Red-Team — Full-Surface Review (2026-09-12)

Method: 22 rendered screenshots (11 routes × 1440/390) from the built site,
each reviewed by an independent vision critique against a PREMIUM MODERN
ENTERPRISE bar; automated gates (arch 201, e2e suites, axe via Browser
Assurance, E4 matrix, budget) run alongside. Findings are classified
P0/P1/P2 with disposition.

## Scores (pre-fix → disposition)

| Surface           | Score  | Key issues                                                                                                                                                    |
| ----------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home EN desktop   | 7/10   | faint borders, weak tags, atlas list density, footer compression                                                                                              |
| Home mobile       | 6.5/10 | OneHouse wall-of-text, atlas graph unreadable at 390, line-height                                                                                             |
| Decision Room     | 7→9    | Compare button weak, CLAIM/TRUST pills weak → **fixed UI-1**                                                                                                  |
| Security          | 7/10   | Source-trace dense/flat, trace lines faint; next-steps ambiguity                                                                                              |
| Products (empty)  | 6/10   | repetition between proof paragraph and lens entry, sparse spacing                                                                                             |
| About             | 6/10   | founder note reads like an unfinished placeholder                                                                                                             |
| VI home           | 8/10   | two awkward VI phrases → **fixed UI-1**; atlas VI truncation                                                                                                  |
| Evidence Passport | 6→8*   | *score dragged by reviewer assuming a wrong "future" date (site date is current 2026-09-12 — NOT a defect); "Source-linked" clarity + context-link prominence |
| 404               | 0→9    | **P0: root 404.html was blank (15 B). Fixed UI-1 + regression test**                                                                                          |

## P0 — fixed in Wave UI-1 (PR #136)

1. **Blank production 404** — root `404.astro` used a template-time redirect
   that built an empty document; every unknown path served a blank page.
   Replaced with a real branded bilingual 404; e2e now asserts served-404
   content (heading + recovery links) on unknown EN/VI paths. `dist/404.html`
   15 B → 15.3 KB.

## P1 — fixed in Wave UI-1 (PR #136)

2. Elevation system missing on cards (`--elevation-1/2`): trust cards (with
   hover), decision-room items, atlas list, passport.
3. Decision-room tag/button hierarchy; source-trace role chips restyled;
   atlas SVG labels enlarged (13 px) + word-boundary truncation (VI-safe).
4. VI copy: "Nâng giới hạn…" → "Nâng cao năng lực cho đội ngũ và người
   dùng."; "tuyến đường hạng nhất" → "ưu tiên hàng đầu"; hero supporting →
   "kiến tạo một ngày mai rạng rỡ".
5. Meta descriptions (privacy/security/support, EN+VI) rewritten unique +
   keyword-aligned; `og:locale` / `og:locale:alternate` added.

## P2 — roadmap (Wave UI-2, bounded)

6. OneHouse mobile density: line-height + dimension-grid air; no content
   removal.
7. Source-trace as a card (surface-subtle container) on security/privacy.
8. Products empty-state: visual de-duplication of the proof paragraph vs
   lens entry (presentation only — copy is contract-pinned), spacing.
9. About founder note: reframe as an intentional, confident statement
   (styling + EN/VI wording) — **no invented biography, photo, or facts**.
10. Footer composition (grid balance) — optional; language switcher OK.

## Red-team notes (rejected / false positives, with rationale)

- "Add testimonials / placeholder client quotes" → **REJECTED**: hard rule
  prohibits fabricated quotes, clients, or proof. Trust layer substitutes
  verifiable evidence; this is the product's differentiator.
- "Add team photos / office shots" → **OWNER-GATED**: no supplied
  photography; inventing imagery violates product truth.
- Passport "reviewed 2026-09-12 is a future date" → **FALSE POSITIVE**
  (current date); the authored date stays exactly as recorded.
- "Buttons inside the hero artwork screenshot differ in style" → artwork is
  a kit master image; out of scope.

## Automated evidence (same day)

arch **201/201** · e2e affected suites 76/76 · E4 matrix ALL PASS · budget
2567 B Brotli · static links PASS · lint/format clean · production smoke ALL
PASS (decision room, passport, manifest live). Browser Assurance runs on
every PR in CI (truth-teller for cross-browser).
