import { expect, test } from "@playwright/test";

test("journey bar offers route-appropriate next steps on /en/about/", async ({
  page,
}) => {
  await page.goto("/en/about/");
  const bar = page.locator("[data-journey-bar]");
  await expect(bar).toBeVisible();
  await expect(
    bar.getByRole("link", { name: /Product status/i }),
  ).toHaveAttribute("href", "/en/products/");
  await expect(bar.getByRole("link", { name: /Contact/i })).toHaveAttribute(
    "href",
    "/en/contact/",
  );
});

test("journey bar renders near the end of content, not as a sticky overlay", async ({
  page,
}) => {
  await page.goto("/en/support/");
  const bar = page.locator("[data-journey-bar]");
  await expect(bar).toBeVisible();
  const position = await bar.evaluate((element) => {
    return getComputedStyle(element).position;
  });
  expect(["static", "relative"]).toContain(position);
  const orderOk = await bar.evaluate((element) => {
    const footer = document.querySelector("footer");
    const main = document.querySelector("main");
    if (!footer || !main) return false;
    const afterContent = Boolean(
      element.compareDocumentPosition(footer) &
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    return main.contains(element) && afterContent;
  });
  expect(orderOk).toBe(true);
});

test("journey bar is localized on /vi/support/", async ({ page }) => {
  await page.goto("/vi/support/");
  const bar = page.locator("[data-journey-bar]");
  await expect(bar).toBeVisible();
  await expect(bar.getByRole("link", { name: /Liên hệ/ })).toHaveAttribute(
    "href",
    "/vi/contact/",
  );
  await expect(bar.getByRole("link", { name: /Bảo mật/ })).toHaveAttribute(
    "href",
    "/vi/security/",
  );
});

test("journey bar is absent where no next step is defined", async ({
  page,
}) => {
  await page.goto("/en/404/");
  await expect(page.locator("[data-journey-bar]")).toHaveCount(0);
});

test("primary nav marks the current page with aria-current", async ({
  page,
}) => {
  await page.goto("/en/about/");
  const primary = page.getByRole("navigation", { name: "Primary" });
  await expect(
    primary.getByRole("link", { name: "About", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    primary.getByRole("link", { name: "Products", exact: true }),
  ).not.toHaveAttribute("aria-current", "page");

  await page.goto("/en/products/");
  await expect(
    page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Products", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("mobile nav keeps aria-current parity", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/vi/about/");
  await page.locator("summary").click();
  const mobile = page.getByRole("navigation", { name: "Mobile" });
  await expect(
    mobile.getByRole("link", { name: "Về BlueSkyz" }),
  ).toHaveAttribute("aria-current", "page");
});
