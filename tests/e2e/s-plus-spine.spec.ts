import { expect, test } from "@playwright/test";

const EN_STAGES = ["Intelligence.", "Elevation.", "Trust.", "Impact."];
const VI_STAGES = ["Trí tuệ.", "Nâng tầm.", "Tin cậy.", "Tác động."];

const escaped = (label: string) => label.replace(".", "\\.");

test("static story spine renders four stages in document order on /en/", async ({
  page,
}) => {
  await page.goto("/en/");
  const spine = page.getByRole("navigation", { name: /Homepage story/i });
  await expect(spine).toBeVisible();
  const links = spine.getByRole("link");
  await expect(links).toHaveCount(4);
  for (const [index, label] of EN_STAGES.entries()) {
    await expect(links.nth(index)).toHaveText(new RegExp(escaped(label), "i"));
  }
});

test("every spine stage links to an existing homepage section id", async ({
  page,
}) => {
  await page.goto("/en/");
  const hrefs = await page
    .getByRole("navigation", { name: /Homepage story/i })
    .getByRole("link")
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("href")),
    );
  expect(hrefs).toEqual([
    "#hero-title",
    "#house-title",
    "#trust-title",
    "#about-title",
  ]);
  for (const href of hrefs) {
    await expect(page.locator(href as string)).toHaveCount(1);
  }
});

test("spine links navigate to their stage with mouse and keyboard", async ({
  page,
}) => {
  await page.goto("/en/");
  const spine = page.getByRole("navigation", { name: /Homepage story/i });
  const trust = spine.getByRole("link", { name: /Trust\./ });
  await trust.click();
  await expect(page).toHaveURL(/#trust-title$/);
  await expect(page.locator("#trust-title")).toBeVisible();

  const impact = spine.getByRole("link", { name: /Impact\./ });
  await impact.focus();
  await expect(impact).toBeFocused();
  await impact.press("Enter");
  await expect(page).toHaveURL(/#about-title$/);
});

test("spine renders localized stages on /vi/", async ({ page }) => {
  await page.goto("/vi/");
  const spine = page.getByRole("navigation", { name: /trang chủ/i });
  await expect(spine).toBeVisible();
  const links = spine.getByRole("link");
  await expect(links).toHaveCount(4);
  for (const [index, label] of VI_STAGES.entries()) {
    await expect(links.nth(index)).toHaveText(new RegExp(escaped(label), "i"));
  }
});

test("320px homepage keeps no horizontal overflow with the spine", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/en/");
  await expect(
    page.getByRole("navigation", { name: /Homepage story/i }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("reduced motion keeps the spine static and complete", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/en/");
  const spine = page.getByRole("navigation", { name: /Homepage story/i });
  await expect(spine.getByRole("link")).toHaveCount(4);
  await context.close();
});
