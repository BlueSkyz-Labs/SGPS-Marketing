import { expect, test, type Page } from "@playwright/test";
import { CLAIMS } from "../../src/data/claims.ts";

/**
 * Trust-surface polish guards (audit TRU-03, TRU-09, TRU-13; TRU-14 was already fixed by #599).
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

/* ── TRU-13: sources line punctuation ────────────────────────────────────── */

const SOURCE_ROUTES = ["security", "privacy", "verify"] as const;

async function sourceTexts(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>(".sources-line")].map(
      (el) => el.innerText,
    ),
  );
}

const strayPunctuation = (texts: string[]) =>
  texts.filter((t) => /\s[.。]/u.test(t));

for (const lang of LOCALES) {
  for (const route of SOURCE_ROUTES) {
    test(`TRU-13 (${lang}) /${route}/: no space before a full stop`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/${route}/`);
      const texts = await sourceTexts(page);
      expect(texts.length).toBeGreaterThan(0);
      expect(strayPunctuation(texts)).toEqual([]);
    });
  }
}

test("TRU-13 negative proof: a spaced full stop is detected", async ({
  page,
}) => {
  await page.goto("/vi/security/");
  await page.evaluate(() => {
    const p = document.querySelector(".sources-line__date")!;
    p.insertAdjacentHTML("beforeend", "<div>.</div>");
  });
  expect(strayPunctuation(await sourceTexts(page))).toHaveLength(1);
});

/** Items whose separator dot is not followed by the link on the same row. */
async function trailingDots(page: Page) {
  return page.evaluate(() => {
    const out: string[] = [];
    for (const item of document.querySelectorAll<HTMLElement>(
      ".sources-line__item",
    )) {
      if (
        !item.previousElementSibling?.classList.contains("sources-line__item")
      )
        continue;
      const content = getComputedStyle(item, "::before").content;
      if (content === "none" || content === "normal") continue;
      const link = item.querySelector<HTMLElement>(
        ".sources-line__link, .sources-line__current",
      )!;
      const dot = item.getBoundingClientRect();
      const l = link.getBoundingClientRect();
      // The dot sits at the item's start edge; the link must come after it.
      const flow = getComputedStyle(item).flexDirection;
      if (flow !== "row" || l.left < dot.left + 1) out.push(item.textContent!);
    }
    return out;
  });
}

for (const route of ["verify", "security", "privacy"] as const) {
  test(`TRU-13 /${route}/ at 320: no separator dot ends a line`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    for (const lang of LOCALES) {
      await page.goto(`/${lang}/${route}/`);
      expect(await trailingDots(page), lang).toEqual([]);
      const dots = await page.evaluate(
        () =>
          [...document.querySelectorAll(".sources-line__item")].filter(
            (el) =>
              getComputedStyle(el, "::before").content !== "none" &&
              getComputedStyle(el, "::before").content !== "normal",
          ).length,
      );
      expect(dots, `${lang} has separators`).toBeGreaterThan(0);
      // Touch targets of the links stay 44px.
      const small = await page.evaluate(
        () =>
          [...document.querySelectorAll(".sources-line__link")].filter(
            (a) => a.getBoundingClientRect().height < 43.5,
          ).length,
      );
      expect(small, `${lang} touch`).toBe(0);
    }
  });
}

test("TRU-13 negative proof: a dot placed after its link is detected", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/vi/verify/");
  await page.addStyleTag({
    content:
      ".sources-line__item + .sources-line__item { flex-direction: row-reverse !important; }",
  });
  expect((await trailingDots(page)).length).toBeGreaterThan(0);
});
