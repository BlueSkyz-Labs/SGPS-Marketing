import { expect, test, type Page } from "@playwright/test";
import { CLAIMS } from "../../src/data/claims.ts";

/**
 * Trust-surface polish guards (audit TRU-03, TRU-09; TRU-14 was already fixed by #599).
 * TRU-13 (sources-line punctuation) changes the visual baselines and ships
 * with them in the protected PR #645.
 *
 * Every guard has a negative proof: the invariant is broken in the live DOM
 * or CSS and the same predicate must then report the breakage.
 */

const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;
type Lang = (typeof LOCALES)[number];

const norm = (text: string) => text.replace(/\s+/g, " ").trim();

/* ── TRU-03: Verify shows the canonical claim statement, by id ───────────── */

async function renderedStatements(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("[data-claim-id]")].map(
      (card) => ({
        id: card.dataset.claimId ?? "",
        text: (
          card.querySelector(".verify-claim__statement")?.textContent ?? ""
        )
          .replace(/\s+/g, " ")
          .trim(),
      }),
    ),
  );
}

function statementMismatches(
  lang: Lang,
  rendered: { id: string; text: string }[],
): string[] {
  const out: string[] = [];
  for (const { id, text } of rendered) {
    const claim = CLAIMS.find((c) => c.id === id);
    if (!claim) out.push(`${id}: unknown claim id`);
    else if (text !== norm((claim.verifyStatement ?? claim.statement)[lang]))
      out.push(`${id}: "${text}" != canonical`);
  }
  return out;
}

for (const lang of LOCALES) {
  test(`TRU-03 (${lang}): /verify/ statements equal the canonical claim records`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/verify/`);
    const rendered = await renderedStatements(page);
    expect(rendered.length).toBeGreaterThanOrEqual(3);
    expect(statementMismatches(lang, rendered)).toEqual([]);
  });
}

test("TRU-03 negative proof: editing one Verify statement is detected", async ({
  page,
}) => {
  await page.goto("/vi/verify/");
  await page.evaluate(() => {
    const el = document.querySelector(
      "[data-claim-id='privacy-no-tracking-on-this-site'] .verify-claim__statement",
    )!;
    el.textContent =
      "Chỉ lưu ngôn ngữ và giao diện bạn chọn trong trình duyệt.";
  });
  const bad = statementMismatches("vi", await renderedStatements(page));
  expect(bad).toHaveLength(1);
  expect(bad[0]).toContain("privacy-no-tracking-on-this-site");
});

/* ── TRU-09: evidence summaries read as disclosures, not links ───────────── */

const SUMMARY_SEL = "main .evidence-details__more > summary";

async function summaryReport(page: Page) {
  return page.evaluate((sel) => {
    const linkColor = getComputedStyle(
      document.querySelector("main a[href]")!,
    ).color;
    return [...document.querySelectorAll<HTMLElement>(sel)].map((el) => {
      const cs = getComputedStyle(el);
      const after = getComputedStyle(el, "::after");
      return {
        text: (el.textContent ?? "").trim(),
        linkLike:
          cs.color === linkColor && cs.textDecorationLine.includes("underline"),
        chevron:
          after.content !== "none" &&
          after.content !== "normal" &&
          parseFloat(after.width) > 0,
      };
    });
  }, SUMMARY_SEL);
}

for (const lang of LOCALES) {
  test(`TRU-09 (${lang}): verify summaries are not link-styled and have a chevron`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/verify/`);
    const report = await summaryReport(page);
    expect(report.length).toBeGreaterThanOrEqual(3);
    for (const row of report) {
      expect(row.linkLike, `${row.text} link-like`).toBe(false);
      expect(row.chevron, `${row.text} chevron`).toBe(true);
    }
    // The chevron turns when the disclosure opens.
    const summary = page.locator(SUMMARY_SEL).first();
    const turn = () =>
      summary.evaluate((el) => getComputedStyle(el, "::after").transform);
    const closed = await turn();
    await summary.click();
    await page.mouse.move(0, 0);
    await expect.poll(turn).not.toBe(closed);
  });
}

test("TRU-09 negative proof: link colour + underline and no chevron are detected", async ({
  page,
}) => {
  await page.goto("/vi/verify/");
  await page.addStyleTag({
    content: `${SUMMARY_SEL} { color: var(--action-primary) !important; text-decoration: underline !important; }
${SUMMARY_SEL}::after { content: none !important; }`,
  });
  const report = await summaryReport(page);
  for (const row of report) {
    expect(row.linkLike).toBe(true);
    expect(row.chevron).toBe(false);
  }
});
