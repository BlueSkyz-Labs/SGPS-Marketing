import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Canonical EN + VI routes. Legacy non-root routes redirect to /en/*; `/` is
// the noindex DEC-019 language gateway. Those contracts live in trust-routes.
const ROUTES = [
  "/en/",
  "/en/products/",
  "/en/products/sotro/",
  "/en/products/sotam/",
  "/en/about/",
  "/en/contact/",
  "/en/support/",
  "/en/privacy/",
  "/en/security/",
  "/en/verify/",
  "/vi/",
  "/vi/products/",
  "/vi/products/sotro/",
  "/vi/products/sotam/",
  "/vi/about/",
  "/vi/contact/",
  "/vi/support/",
  "/vi/privacy/",
  "/vi/security/",
  "/vi/verify/",
  "/zh/",
  "/zh/verify/",
  "/zh/products/sotro/",
  "/zh/products/sotam/",
  "/zh-hant/",
  "/zh-hant/products/sotro/",
  "/zh-hant/products/sotam/",
  "/zh-hant/verify/",
] as const;

for (const route of ROUTES) {
  test(`axe has no critical/serious violations on ${route}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response, `${route} response`).not.toBeNull();
    expect(response!.status(), `${route} status`).toBeLessThan(500);

    const results = await new AxeBuilder({ page })
      .withTags([
        "wcag2a",
        "wcag2aa",
        "wcag21a",
        "wcag21aa",
        "wcag22a",
        "wcag22aa",
      ])
      .analyze();

    const serious = results.violations.filter((violation) =>
      ["critical", "serious"].includes(violation.impact ?? ""),
    );

    expect(
      serious,
      serious
        .map(
          (violation) =>
            `${violation.id}: ${violation.help} (${violation.nodes.length} nodes)`,
        )
        .join("\n"),
    ).toEqual([]);
  });
}

test("skip link moves focus to main content", async ({ page }) => {
  await page.goto("/en/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: /Skip to main content/i });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("mobile menu disclosure is keyboard operable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/");
  const summary = page.locator("header details summary");
  await expect(summary).toBeVisible();
  await summary.focus();
  await expect(summary).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("header details")).toHaveAttribute("open", "");
  await expect(
    page.getByRole("navigation", { name: "Mobile" }).getByRole("link").first(),
  ).toBeVisible();
});

/**
 * F-23 guard (2026-09-29). The project standard is zero interactive targets
 * under 44 x 44 px. Two-character zh labels only met the height: the footer nav
 * links measured 30x44 and the profile breadcrumb 28x44 at 390 px, while the
 * longer en/vi labels stayed above 44 px and hid the defect (the audit round 2
 * note G-5: the same rule also failed on en/vi, e.g. the footer "About" link at
 * 42x44). This scans both index and product-detail routes in all three locales
 * and reports every offender with its text and measured box.
 */
const TARGET_ROUTES = [
  "/en/verify/",
  "/en/",
  "/vi/",
  "/zh/",
  "/en/products/sotro/",
  "/vi/products/sotro/",
  "/zh/products/sotro/",
  "/zh-hant/",
  "/zh-hant/products/sotro/",
] as const;

for (const route of TARGET_ROUTES) {
  test(`no interactive target under 44px on ${route} at 390px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const offenders = await page.evaluate(() => {
      const rows: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>(
        'a[href], button, [role="button"], summary, input[type="checkbox"], select',
      )) {
        const box = el.getBoundingClientRect();
        if (!box.width || !box.height) continue;
        const style = getComputedStyle(el);
        if (style.visibility === "hidden" || style.display === "none") continue;
        if (box.width < 44 || box.height < 44) {
          const text = (el.innerText || el.getAttribute("aria-label") || "")
            .trim()
            .slice(0, 28);
          rows.push(
            `${el.tagName.toLowerCase()} ${Math.round(box.width)}x${Math.round(box.height)} "${text}"`,
          );
        }
      }
      return rows;
    });
    expect(offenders, offenders.join("\n")).toEqual([]);
  });
}

// axe reports aria-label on a role-less <div> as `incomplete` (needs review),
// never as a violation, so the violation-only gate above cannot see it.
for (const route of ["/en/products/", "/vi/products/", "/zh/", "/zh-hant/"]) {
  test(`axe has no aria-prohibited-attr (incl. needs-review) on ${route}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route, { waitUntil: "networkidle" });
    const results = await new AxeBuilder({ page })
      .withRules(["aria-prohibited-attr"])
      .analyze();
    expect(
      [...results.violations, ...results.incomplete].map((r) => r.id),
    ).toEqual([]);
  });
}
