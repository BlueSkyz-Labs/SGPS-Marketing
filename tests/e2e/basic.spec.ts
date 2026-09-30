import { test, expect } from "@playwright/test";
import { hasPublicProducts } from "./product-helpers.ts";

test.describe("Smoke — Astro foundation", () => {
  test("home page loads the BlueSkyz Labs proposition", async ({ page }) => {
    const response = await page.goto("/en/", { waitUntil: "domcontentloaded" });
    expect(response, "navigation response").not.toBeNull();
    expect(response!.status(), "HTTP status").toBeLessThan(400);
    // Experience v6 S1: the H1 is the flagship's first recorded job; the brand
    // tagline is stated once, in the footer.
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      hasPublicProducts
        ? "See what remains unpaid this month"
        : "Intelligence. Elevated.",
    );
    await expect(page.getByRole("contentinfo")).toContainText(
      "Intelligence. Elevated.",
    );
    await expect(page.locator("main#main-content")).toBeVisible();
  });

  test("no console errors during load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/en/", { waitUntil: "networkidle" });
    expect(errors, `Unexpected console errors:\n${errors.join("\n")}`).toEqual(
      [],
    );
  });

  test("Vietnamese homepage renders correctly", async ({ page }) => {
    await page.goto("/vi/");
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      hasPublicProducts ? /chưa đóng tiền/ : /Trí tuệ|Nâng tầm|Tác động/,
    );
    await expect(page.getByRole("contentinfo")).toContainText(/Trí tuệ/);
  });
});
