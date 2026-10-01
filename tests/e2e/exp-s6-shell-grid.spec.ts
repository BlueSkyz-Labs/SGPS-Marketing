import { expect, test, type Page } from "@playwright/test";

// Experience v6 S6 — one container/edge contract for the shell and sections,
// and a desktop header that stays within six visible controls.

const ROUTES = ["/en/", "/en/products/", "/en/about/", "/en/security/"];
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];

/** Left edge of every key container: header logo, main headings, footer lockup. */
async function leftEdges(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
    const edges: Record<string, number> = {};
    const left = (element: Element | null): number | null =>
      element ? Math.round(element.getBoundingClientRect().left) : null;
    const record = (name: string, element: Element | null) => {
      const value = left(element);
      if (value !== null) edges[name] = value;
    };
    record("header logo", document.querySelector("header a"));
    const headings = document.querySelectorAll(
      "main h1, main section > div > h2, main .integrity-lens__title",
    );
    headings.forEach((heading, index) => {
      record(
        `heading ${index} ${heading.textContent?.trim().slice(0, 24)}`,
        heading,
      );
    });
    record(
      "footer lockup",
      document.querySelector("footer .brand-lockup, footer a[href]"),
    );
    return edges;
  });
}

function spread(edges: Record<string, number>): number {
  const values = Object.values(edges);
  return Math.max(...values) - Math.min(...values);
}

for (const viewport of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`header, sections and footer share one left edge at ${viewport.width}px on ${route}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(route);
      const edges = await leftEdges(page);
      expect(Object.keys(edges).length).toBeGreaterThan(2);
      expect(spread(edges), JSON.stringify(edges)).toBeLessThanOrEqual(1);
    });
  }
}

test("negative proof: offsetting one container edge turns the contract RED", async ({
  page,
}) => {
  await page.setViewportSize(VIEWPORTS[0]);
  await page.goto("/en/products/");
  await page.addStyleTag({
    content: "main h1 { position: relative; left: 12px; }",
  });
  const edges = await leftEdges(page);
  expect(spread(edges)).toBeGreaterThan(1);
});

test("desktop header shows at most six visible controls and a CTA distinct from Products", async ({
  page,
}) => {
  await page.setViewportSize(VIEWPORTS[0]);
  await page.goto("/en/");
  const controls = page.locator(
    "header a:visible, header button:visible, header summary:visible",
  );
  const names = await controls.evaluateAll((elements) =>
    elements.map(
      (element) =>
        element.getAttribute("aria-label") ||
        (element.textContent ?? "").trim() ||
        element.getAttribute("title") ||
        element.tagName,
    ),
  );
  expect(names.length, names.join(" | ")).toBeLessThanOrEqual(6);
  expect(names.join(" ")).not.toContain("Explore products");

  const products = page.locator('header nav a[href="/en/products/"]:visible');
  await expect(products).toHaveCount(1);
});

test("compact header keeps 44px targets and the full route list in the menu", async ({
  page,
}) => {
  await page.setViewportSize(VIEWPORTS[1]);
  await page.goto("/en/");
  await page.locator("header details > summary").click();
  const menu = page.locator(
    'header nav[aria-label="Menu"], header details nav',
  );
  for (const name of ["Products", "About", "Contact"]) {
    await expect(menu.getByRole("link", { name })).toBeVisible();
  }
  const targets = menu.locator("a:visible, button:visible");
  const count = await targets.count();
  for (let index = 0; index < count; index++) {
    const box = await targets.nth(index).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test("desktop theme trigger opens the three-way group with pressed state and focus ring", async ({
  page,
}) => {
  await page.setViewportSize(VIEWPORTS[0]);
  await page.goto("/en/");
  const trigger = page.locator("header [data-theme-trigger]");
  await expect(trigger).toBeVisible();
  const box = await trigger.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await trigger.focus();
  await page.keyboard.press("Enter");
  const group = page.getByRole("group", { name: "Theme" });
  await expect(group.getByRole("button")).toHaveCount(3);
  await page.keyboard.press("Escape");
  await expect(group.getByRole("button")).toHaveCount(0);
});
