import { test, expect } from "@playwright/test";

test.describe("Smoke — Astro foundation", () => {
  test("home page loads the BlueSkyz Labs proposition", async ({ page }) => {
    const response = await page.goto("/en/", { waitUntil: "domcontentloaded" });
    expect(response, "navigation response").not.toBeNull();
    expect(response!.status(), "HTTP status").toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Intelligence. Elevated.",
    );
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Impact.",
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
      /Trí tuệ|Nâng tầm|Tác động/,
    );
  });
});
