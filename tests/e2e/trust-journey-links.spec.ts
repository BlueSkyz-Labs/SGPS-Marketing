import { expect, test, type Page } from "@playwright/test";

/**
 * Owner trust-journey decisions 2026-10-20 (TRU-02, TRU-04, TRU-12).
 *
 * - TRU-02: on the Compare claims cards the claim title links to its
 *   per-claim evidence passport; the "open source" link is unchanged.
 * - TRU-04: the security claim's source is the Security page, not the GitHub
 *   form (the form stays as the Security page action).
 * - TRU-12: the passport ends with "<- all claims" (Verify nav label) and the
 *   Contact nav label; the privacy passport no longer lists the Security page.
 *
 * Labels are the existing nav labels (src/data/site.ts NAV_LABELS), repeated
 * here as the Owner-approved expectation, not authored copy.
 */
const LOCALES = [
  { lang: "en", claims: "Verify", contact: "Contact", source: "Open source" },
  { lang: "vi", claims: "Kiểm chứng", contact: "Liên hệ", source: "Mở nguồn" },
  { lang: "zh", claims: "核实", contact: "联系我们", source: "打开来源" },
  {
    lang: "zh-hant",
    claims: "查證",
    contact: "聯絡我們",
    source: "開啟來源",
  },
] as const;

const SECURITY_CLAIM = "security-reporting-is-private";

/** Every claim card title links to its passport; other kinds do not. */
async function assertTitleLinks(page: Page, lang: string): Promise<void> {
  const claimItems = page.locator(
    '[data-decision-item][data-item-kind="claim"]',
  );
  const count = await claimItems.count();
  expect(count).toBeGreaterThanOrEqual(3);
  for (let i = 0; i < count; i += 1) {
    const item = claimItems.nth(i);
    const id = ((await item.getAttribute("data-decision-item")) ?? "").replace(
      "claim:",
      "",
    );
    await expect(item.locator("h3 a")).toHaveAttribute(
      "href",
      `/${lang}/evidence/${id}/`,
    );
  }
  await expect(
    page.locator('[data-decision-item]:not([data-item-kind="claim"]) h3 a'),
  ).toHaveCount(0);
}

for (const { lang, claims, contact, source } of LOCALES) {
  test.describe(`trust journey links (${lang})`, () => {
    test("TRU-02: claim titles link to the passport, source link stays", async ({
      page,
    }) => {
      await page.goto(`/${lang}/decision-room/`);
      await assertTitleLinks(page, lang);
      const card = page.locator(
        `[data-decision-item="claim:${SECURITY_CLAIM}"]`,
      );
      await expect(
        card.locator("a.decision-room__source").first(),
      ).toContainText(source);
    });

    test("TRU-04: the security claim source is the Security page", async ({
      page,
    }) => {
      await page.goto(`/${lang}/decision-room/`);
      const card = page.locator(
        `[data-decision-item="claim:${SECURITY_CLAIM}"]`,
      );
      await expect(card.locator("a.decision-room__source")).toHaveAttribute(
        "href",
        `/${lang}/security/`,
      );
    });

    test("TRU-12: passport ends with claims and contact links", async ({
      page,
    }) => {
      await page.goto(`/${lang}/evidence/${SECURITY_CLAIM}/`);
      const next = page.locator("[data-passport-next]");
      await expect(next.locator("a")).toHaveCount(2);
      await expect(next.locator("[data-passport-next-claims]")).toHaveText(
        `← ${claims}`,
      );
      await expect(next.locator("[data-passport-next-claims]")).toHaveAttribute(
        "href",
        `/${lang}/verify/`,
      );
      await expect(next.locator("[data-passport-next-contact]")).toHaveText(
        contact,
      );
      await expect(
        next.locator("[data-passport-next-contact]"),
      ).toHaveAttribute("href", `/${lang}/contact/`);
    });
  });
}

test("links are plain anchors without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/vi/decision-room/");
  await assertTitleLinks(page, "vi");
  await page.goto(`/vi/evidence/${SECURITY_CLAIM}/`);
  await expect(page.locator("[data-passport-next] a")).toHaveCount(2);
  await context.close();
});

test("negative proof: the guard fails when a title link is unwrapped", async ({
  page,
}) => {
  await page.goto("/en/decision-room/");
  await page.evaluate(() => {
    const a = document.querySelector("[data-decision-item] h3 a");
    if (a) a.replaceWith(...Array.from(a.childNodes));
  });
  await expect(assertTitleLinks(page, "en")).rejects.toThrow();
});
