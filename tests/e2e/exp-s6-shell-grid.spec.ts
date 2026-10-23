import { expect, test, type Page } from "@playwright/test";

// Experience v6 S6 — one container/edge contract for the shell and sections,
// and a desktop header that stays within seven visible controls (Owner 2026-10-18, A-03).

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

test("desktop header shows at most nine visible controls and a CTA distinct from Products", async ({
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
  // Owner 2026-10-18 (audit A-03): Contact joins About in the desktop nav,
  // so the cap moves from six to seven controls. Owner 2026-10-24 (O-05):
  // Verify joins the desktop nav; with Journey (en/vi, TRU-15) the cap is
  // exactly nine, and the ordered link list below fails on any further addition.
  expect(names.length, names.join(" | ")).toBe(9);
  expect(names.join(" ")).not.toContain("Explore products");
  await expect(
    page.locator('header nav[aria-label="Primary"] a:visible'),
  ).toHaveText(["About", "Contact", "Verify", "Journey", "Products"]);

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
  for (const name of ["Products", "About", "Contact", "Verify"]) {
    await expect(menu.getByRole("link", { name })).toBeVisible();
  }
  const targets = menu.locator("a:visible, button:visible");
  const count = await targets.count();
  for (let index = 0; index < count; index++) {
    const box = await targets.nth(index).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

// With nine desktop controls the en / vi nav wrapped to two or three rows
// between 768 and 1023px. The desktop nav starts at 1024px; below that the
// compact menu carries the routes, so the header bar is one row at every width.
test("header bar stays one row from tablet to desktop in en, vi and zh", async ({
  page,
}) => {
  for (const lang of ["en", "vi", "zh"]) {
    for (const width of [768, 900, 1023, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`/${lang}/`);
      const bar = page.locator("header .header-bar").first();
      const brand = await bar.locator(".brand-lockup").first().boundingBox();
      const items = await bar
        .locator(":scope > nav:visible, :scope > details:visible")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getBoundingClientRect().top),
        );
      expect(items.length, `${lang} ${width}`).toBe(1);
      const box = await bar.boundingBox();
      expect(
        box!.height,
        `${lang} ${width}: header bar ${box!.height}px`,
      ).toBeLessThanOrEqual(brand!.height + 32);
      const rows = await bar.locator(":scope > nav:visible > *").evaluateAll(
        (nodes) =>
          new Set(
            nodes
              .filter((node) => node.getBoundingClientRect().height > 0)
              .map((node) => {
                const r = node.getBoundingClientRect();
                return Math.round((r.top + r.bottom) / 2 / 16);
              }),
          ).size,
      );
      expect(rows, `${lang} ${width}: nav rows`).toBeLessThanOrEqual(1);
    }
  }
});

test("desktop theme icon flips the theme on Enter with no popup (HC-7)", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.setViewportSize(VIEWPORTS[0]);
  await page.goto("/en/");
  const trigger = page.locator("header [data-theme-trigger]").first();
  await expect(trigger).toBeVisible();
  const box = await trigger.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("group", { name: "Theme" })).toHaveCount(0);
  await expect(page.locator("[popover]:popover-open")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
