import { expect, test, type Page } from "@playwright/test";

/**
 * Owner Decision Room decisions 2026-10-20 (G5 / TRU-06, TRU-07, TRU-11).
 *
 * - TRU-06: the first selection brings the comparison tray into view, once,
 *   without moving focus; reduced motion jumps instead of animating.
 * - TRU-07: each compared item carries its canonical boundary in the tray,
 *   under the existing "Boundary" label (ProvenanceLens `boundary`).
 * - G5: the dossier handoff link is the secondary button style.
 * - TRU-11: with scripting off the lede is the approved static lede and the
 *   "nothing selected" line is hidden.
 *
 * Strings are Owner-approved / existing labels, repeated here as expectations.
 */
const LOCALES = [
  {
    lang: "en",
    staticLede: "Public claims, with their sources and limits.",
    boundary: "Boundary",
  },
  {
    lang: "vi",
    staticLede: "Các tuyên bố công khai, kèm nguồn và giới hạn.",
    boundary: "Ranh giới",
  },
  { lang: "zh", staticLede: "公开声明，附来源与边界。", boundary: "边界" },
  {
    lang: "zh-hant",
    staticLede: "公開聲明，附來源與邊界。",
    boundary: "邊界",
  },
] as const;

const ADD = "[data-decision-add]";

async function spyScroll(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __scrolls: unknown[] };
    w.__scrolls = [];
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (arg?: unknown) {
      w.__scrolls.push({
        tray: (this as HTMLElement).hasAttribute("data-decision-tray"),
        arg,
      });
      return original.call(this, arg as ScrollIntoViewOptions);
    };
  });
}

const scrolls = (page: Page) =>
  page.evaluate(
    () =>
      (window as unknown as { __scrolls: { tray: boolean; arg: unknown }[] })
        .__scrolls,
  );

test.describe("Decision Room flow (G5)", () => {
  test("TRU-06: only the first selection scrolls the tray into view, focus stays", async ({
    page,
  }) => {
    await spyScroll(page);
    await page.goto("/en/decision-room/");
    const adds = page.locator(ADD);
    const trayTop = await page
      .locator("[data-decision-tray]")
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(trayTop).toBeGreaterThan(
      page.viewportSize()?.height ?? Number.MAX_SAFE_INTEGER,
    );

    await adds.nth(0).click();
    expect(await scrolls(page)).toEqual([
      { tray: true, arg: { behavior: "smooth", block: "nearest" } },
    ]);
    await expect
      .poll(() =>
        page
          .locator("[data-decision-tray]")
          .evaluate(
            (el) => el.getBoundingClientRect().bottom <= window.innerHeight + 1,
          ),
      )
      .toBe(true);
    await expect(adds.nth(0)).toBeFocused();

    await adds.nth(1).click();
    await adds.nth(2).click();
    expect((await scrolls(page)).length).toBe(1);
    await expect(adds.nth(2)).toBeFocused();
  });

  test("TRU-06: reduced motion jumps instantly", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await spyScroll(page);
    await page.goto("/en/decision-room/");
    await page.locator(ADD).nth(0).click();
    expect(await scrolls(page)).toEqual([
      { tray: true, arg: { behavior: "auto", block: "nearest" } },
    ]);
  });

  test("TRU-06: a comparison restored from the URL does not scroll", async ({
    page,
  }) => {
    await spyScroll(page);
    await page.goto("/en/decision-room/");
    const id = await page.locator(ADD).nth(0).getAttribute("data-decision-add");
    await page.goto(
      `/en/decision-room/?compare=${encodeURIComponent(id ?? "")}`,
    );
    await expect(page.locator("[data-decision-board]")).toBeVisible();
    await page.locator(ADD).nth(1).click();
    expect(await scrolls(page)).toEqual([]);
  });

  for (const { lang, boundary } of LOCALES) {
    test(`TRU-07 + secondary handoff: tray shows the boundary row (${lang})`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/decision-room/`);
      const card = page
        .locator("[data-decision-item][data-has-boundary]")
        .first();
      const id = (await card.getAttribute("data-decision-item")) ?? "";
      const cardBoundary = (
        (await card.locator(".decision-room__boundary").textContent()) ?? ""
      ).trim();
      expect(cardBoundary.length).toBeGreaterThan(0);

      await card.locator(ADD).click();
      const row = page.locator(`[data-decision-row="${id}"]`);
      const rowBoundary = row.locator("[data-decision-row-boundary]");
      await expect(rowBoundary).toBeVisible();
      await expect(
        rowBoundary.locator(".decision-room__row-boundary-label"),
      ).toHaveText(boundary);
      await expect(rowBoundary.locator(".decision-room__boundary")).toHaveText(
        cardBoundary,
      );

      // Items without a boundary get no boundary row.
      const plain = page
        .locator("[data-decision-item]:not([data-has-boundary])")
        .first();
      if ((await plain.count()) > 0) {
        const plainId = (await plain.getAttribute("data-decision-item")) ?? "";
        await expect(
          page.locator(
            `[data-decision-row="${plainId}"] [data-decision-row-boundary]`,
          ),
        ).toHaveCount(0);
      }
    });

    test(`G5: handoff link is a secondary button with 44px target (${lang})`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/decision-room/`);
      await expect(page.locator("[data-atelier-handoff-link]")).toBeHidden();
      await page.locator('[data-decision-add^="claim:"]').first().click();
      const link = page.locator("[data-atelier-handoff-link]");
      await expect(link).toBeVisible();
      await expect(link).toHaveClass(/btn--secondary/);
      await expect(link).toHaveAttribute("data-button-variant", "secondary");
      expect(((await link.textContent()) ?? "").trim().length).toBeGreaterThan(
        0,
      );
      expect((await link.getAttribute("href")) ?? "").toContain("items=");
      const box = await link.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    });

    test(`TRU-11: no-JS shows the static lede and hides the status line (${lang})`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(`/${lang}/decision-room/`);
      const room = page.locator("[data-decision-room]");
      const ledes = room.locator(".decision-room__lede:visible");
      await expect(ledes).toHaveCount(1);
      await expect(ledes).toHaveText(
        LOCALES.find((l) => l.lang === lang)?.staticLede ?? "",
      );
      await expect(room.locator("[data-decision-empty-state]")).toBeHidden();
      await context.close();
    });

    test(`TRU-11: with JS the working lede and status line stay (${lang})`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/decision-room/`);
      const room = page.locator("[data-decision-room]");
      await expect(room.locator(".decision-room__lede--js")).toBeVisible();
      await expect(room.locator(".decision-room__lede--static")).toBeHidden();
      await expect(room.locator("[data-decision-empty-state]")).toBeVisible();
    });
  }
});
