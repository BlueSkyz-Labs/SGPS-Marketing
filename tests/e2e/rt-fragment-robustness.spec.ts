import { expect, test } from "@playwright/test";

/*
 * Red-team finding RT-05 (2026-10-03): a malformed URL fragment threw an
 * uncaught URIError from the Verify deep-link opener. A hostile or mistyped
 * link must never break page scripts.
 */
for (const path of ["/en/verify/#%E0%A4%A", "/vi/verify/#%", "/en/#%E0%A4%A"]) {
  test(`malformed fragment does not throw on ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(path);
    await page.waitForLoadState("load");
    expect(errors).toEqual([]);
  });
}
