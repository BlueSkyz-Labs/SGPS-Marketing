import { expect, test, type Page } from "@playwright/test";

/**
 * Header menu layout shift (mobile CLS). When the parser yields between
 * `<details>` and its `<summary>`, the browser paints its default "Details"
 * summary (68x24) where the 44 px Menu control will be, and the swap is a
 * layout shift on every mobile page (w0-gap-fixes G3, zh-hant 0.00018).
 * A throttled CLS run is not deterministic enough for a gate, so this guards
 * the cause: a header disclosure without its own summary takes no box.
 */
test.use({ viewport: { width: 390, height: 844 } });

const bareDetailsBox = (page: Page) =>
  page.evaluate(() => {
    const real = document.querySelector("header details");
    if (!real) return null;
    const bare = document.createElement("details");
    bare.className = real.className;
    real.after(bare);
    const box = bare.getBoundingClientRect();
    const result = { width: box.width, height: box.height };
    bare.remove();
    return result;
  });

for (const lang of ["en", "vi", "zh", "zh-hant"] as const) {
  test(`${lang}: a header disclosure takes no box before its summary`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/`);
    const menu = page.locator("header details > summary");
    await expect(menu).toBeVisible();
    expect((await menu.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    expect(await bareDetailsBox(page)).toEqual({ width: 0, height: 0 });
  });
}

test("the disclosure renders as soon as its summary arrives", async ({
  page,
}) => {
  await page.goto("/vi/");
  const height = await page.evaluate(() => {
    const real = document.querySelector("header details");
    const bare = document.createElement("details");
    bare.className = real?.className ?? "";
    real?.after(bare);
    const summary = document.createElement("summary");
    summary.textContent = "Menu";
    bare.append(summary);
    const value = bare.getBoundingClientRect().height;
    bare.remove();
    return value;
  });
  expect(height).toBeGreaterThan(0);
});

test("negative proof: without the rule the default summary takes a box", async ({
  page,
}) => {
  await page.goto("/vi/");
  await page.addStyleTag({
    content: "header details { display: block !important; }",
  });
  const box = await bareDetailsBox(page);
  expect(box?.height).toBeGreaterThan(0);
});
