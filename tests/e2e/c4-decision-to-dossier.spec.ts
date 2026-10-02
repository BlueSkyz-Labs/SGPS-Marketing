import { expect, test } from "@playwright/test";

/**
 * C4-E Task 5 (v8 W5b: one board action) - Compare claims to summary handoff.
 *
 * The visitor's own comparison is the only input: nothing is selected for
 * them, nothing is remembered, and the destination is an ordinary same-origin
 * link on the board. There is no per-card checkbox.
 */
const CLAIM_ADD = '[data-decision-add^="claim:"]';
const LINK = "[data-atelier-handoff-link]";

test.describe("C4-E compare claims to summary handoff", () => {
  test("nothing is compared on load and there is no destination yet", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    expect(await page.locator(CLAIM_ADD).count()).toBeGreaterThan(0);
    await expect(page.locator(`${CLAIM_ADD}[aria-pressed="true"]`)).toHaveCount(
      0,
    );
    await expect(page.locator(LINK)).toBeHidden();
    await expect(page.locator("[data-atelier-item-select]")).toHaveCount(0);
  });

  test("only the claims the visitor compares appear in the destination", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    const first = page.locator(CLAIM_ADD).first();
    const id = await first.getAttribute("data-decision-add");
    await first.click();

    const link = page.locator(LINK);
    await expect(link).toBeVisible();
    const href = (await link.getAttribute("href")) ?? "";
    const carried =
      new URLSearchParams(href.split("?")[1]).get("items")?.split(",") ?? [];
    expect(carried).toEqual([(id ?? "").replace(/^claim:/, "")]);
    // and it is an ordinary same-origin link
    expect(href.startsWith("/en/dossier/?")).toBe(true);
  });

  test("removing the claim makes the destination disappear again", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    const first = page.locator(CLAIM_ADD).first();
    await first.click();
    await expect(page.locator(LINK)).toBeVisible();
    await first.click();
    await expect(page.locator(LINK)).toBeHidden();
  });

  test("a trust or product item alone offers no destination", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    await page
      .locator('[data-decision-add]:not([data-decision-add^="claim:"])')
      .first()
      .click();
    await expect(page.locator(LINK)).toBeHidden();
  });

  test("following the action does not happen on selection and nothing is stored", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    await page.evaluate(() => sessionStorage.clear());
    const before = new URL(page.url()).pathname;
    await page.locator(CLAIM_ADD).first().click();
    expect(new URL(page.url()).pathname).toBe(before);
    expect(await page.evaluate(() => localStorage.length)).toBe(0);
    expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  });

  test("the destination follows catalog order, not the order compared", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    const adds = page.locator(CLAIM_ADD);
    test.skip((await adds.count()) < 2, "needs at least two composable claims");
    await adds.nth(1).click();
    await adds.nth(0).click();
    const href = (await page.locator(LINK).getAttribute("href")) ?? "";
    const carried =
      new URLSearchParams(href.split("?")[1]).get("items")?.split(",") ?? [];
    expect(carried.length).toBe(2);
    const values = await adds.evaluateAll((nodes) =>
      nodes.map((node) =>
        (node.getAttribute("data-decision-add") ?? "").replace(/^claim:/, ""),
      ),
    );
    expect(carried).toEqual(values.filter((value) => carried.includes(value)));
  });

  test("the handoff copy is localized", async ({ page }) => {
    const texts: Record<string, string> = {};
    for (const lang of ["en", "vi", "zh", "zh-hant"]) {
      await page.goto(`/${lang}/decision-room/`);
      await page.locator(CLAIM_ADD).first().click();
      texts[lang] = (await page.locator(LINK).textContent()) ?? "";
    }
    expect(new Set(Object.values(texts)).size).toBe(4);
  });
});
