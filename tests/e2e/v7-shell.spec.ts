import { expect, test } from "@playwright/test";

const parse = (rgb: string): number[] =>
  (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);

test.describe("v7 shell", () => {
  test("B-01 skip link is legible in both themes", async ({ page }) => {
    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/en/");
      await page.keyboard.press("Tab");
      const { bg, fg } = await page.evaluate(() => {
        const el = document.querySelector(".skip-link")!;
        const style = getComputedStyle(el);
        return { bg: style.backgroundColor, fg: style.color };
      });
      expect(bg, `skip link colours in ${scheme}`).not.toBe(fg);
      const distance = parse(bg).reduce(
        (sum, v, i) => sum + Math.abs(v - parse(fg)[i]!),
        0,
      );
      expect(distance).toBeGreaterThan(300);
    }
  });

  test("B-02/B-03 command palette is centred with room for focus rings", async ({
    page,
  }) => {
    await page.goto("/en/");
    await page.keyboard.press("Control+k");
    const dialog = page.locator("dialog[data-command-navigator]");
    await expect(dialog).toBeVisible();
    const box = (await dialog.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(box.x).toBeGreaterThanOrEqual(15);
    expect(box.y).toBeGreaterThan(viewport.height * 0.05);
    const left = box.x;
    const right = viewport.width - (box.x + box.width);
    expect(Math.abs(left - right)).toBeLessThanOrEqual(2);
    const list = await page.evaluate(() => {
      const ul = document.querySelector(".command-navigator__list")!;
      const a = ul.querySelector("a")!;
      return {
        padding: parseFloat(getComputedStyle(ul).paddingTop),
        rowPad: parseFloat(getComputedStyle(a).paddingTop),
      };
    });
    expect(list.padding).toBeGreaterThanOrEqual(4);
    expect(list.rowPad).toBeGreaterThanOrEqual(8);
  });

  test("B-15 header is opaque or blurred, never bare translucent", async ({
    page,
  }) => {
    await page.goto("/en/verify/");
    const header = await page.evaluate(() => {
      const style = getComputedStyle(document.querySelector("header")!);
      const alpha = Number(style.backgroundColor.match(/[\d.]+/g)?.[3] ?? "1");
      return {
        alpha,
        blur: style.backdropFilter,
        position: style.position,
      };
    });
    if (header.alpha < 1) {
      expect(header.position).toBe("sticky");
      expect(header.blur).toContain("blur");
    }
  });

  test("B-16 current page link is distinguishable without colour", async ({
    page,
    isMobile,
  }) => {
    // About is the plain primary link (Products is the filled CTA, v7 A-12).
    await page.goto("/en/about/");
    if (isMobile) await page.locator("header summary").click();
    const current = page
      .locator(
        isMobile
          ? 'header details nav a[aria-current="page"]'
          : 'header nav a[aria-current="page"]',
      )
      .first();
    await expect(current).toBeVisible();
    const style = await current.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        weight: Number(s.fontWeight),
        line: s.textDecorationLine,
        shadow: s.boxShadow,
      };
    });
    expect(style.weight).toBeGreaterThanOrEqual(600);
    expect(style.line === "underline" || style.shadow !== "none").toBe(true);
  });

  test("B-18 buttons advertise themselves with a pointer", async ({ page }) => {
    await page.goto("/en/");
    const cursors = await page.evaluate(() =>
      [...document.querySelectorAll("button:not(:disabled)")].map(
        (el) => getComputedStyle(el).cursor,
      ),
    );
    expect(cursors.length).toBeGreaterThan(0);
    expect(cursors.filter((c) => c !== "pointer")).toEqual([]);
  });

  test("B-22 no infinite animations in the shell", async ({ page }) => {
    await page.goto("/en/");
    const infinite = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations === Infinity)
        .map((a) => (a as CSSAnimation).animationName),
    );
    expect(infinite).toEqual([]);
  });

  test("A-11 footer links are grouped under labels from existing strings", async ({
    page,
  }) => {
    await page.goto("/en/about/");
    const groups = page.locator("footer nav ul[aria-labelledby]");
    expect(await groups.count()).toBe(3);
    for (const name of ["BlueSkyz", "Trust", "Evidence"]) {
      await expect(
        page.locator("footer nav").getByRole("list", { name }),
      ).toHaveCount(1);
    }
    expect(await page.locator("footer nav ul[aria-labelledby] a").count()).toBe(
      10,
    );
  });

  test("B-24 zh palette finds 验证 and the 选集 / 公开档案 pages", async ({
    page,
  }) => {
    await page.goto("/zh/");
    await page.keyboard.press("Control+k");
    const input = page.locator("[data-command-input]");
    for (const [query, href] of [
      ["验证", "/zh/verify/"],
      ["精选集合", "/zh/editions/"],
      ["档案", "/zh/dossier/"],
    ] as const) {
      await input.fill(query);
      await expect(
        page.locator(`[data-command-item]:not([hidden]) a[href="${href}"]`),
      ).toHaveCount(1);
    }
  });
});

test.describe("v7 shell without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("C-06 locale links stay reachable and no dead theme control shows", async ({
    page,
  }) => {
    await page.goto("/en/about/");
    // The footer switcher is a native popover: it opens without JavaScript.
    const footer = page.locator("footer");
    await footer.locator("[data-language-trigger]").first().click();
    await expect(
      footer.locator('[data-language-choice="zh"]').first(),
    ).toBeVisible();
    await expect(page.locator("[data-theme-trigger]")).toBeHidden();
    await expect(page.locator("[data-theme-mode]").first()).toBeHidden();
  });
});
