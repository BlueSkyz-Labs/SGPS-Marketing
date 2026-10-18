import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { isInlineSentenceLink } from "./helpers/inline-target";

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
 *
 * Owner decision 2026-10-18 (audit B-01): one narrow exception, the WCAG 2.5.8
 * inline exception. A link whose computed display is `inline` and that sits in
 * a run of sentence text inside a <p> is exempt from the size floor, because
 * padding it to 44px makes its hit box cover the neighbouring line. In return,
 * two exempt links may never overlap, and each exempt link's destination must
 * also be reachable from a tap-sized target on the same page (guards below).
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
    const offenders = await page.evaluate((exemptSrc) => {
      const inlineExempt = new Function(`return ${exemptSrc}`)() as (
        el: Element,
      ) => boolean;
      const rows: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>(
        'a[href], button, [role="button"], summary, input[type="checkbox"], select',
      )) {
        const box = el.getBoundingClientRect();
        if (!box.width || !box.height) continue;
        const style = getComputedStyle(el);
        if (style.visibility === "hidden" || style.display === "none") continue;
        if (inlineExempt(el)) continue;
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
    }, isInlineSentenceLink.toString());
    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  test(`inline sentence links on ${route} at 390px never overlap and have a tap-sized twin`, async ({
    page,
  }) => {
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const problems = await page.evaluate((exemptSrc) => {
        const inlineExempt = new Function(`return ${exemptSrc}`)() as (
          el: Element,
        ) => boolean;
        const out: string[] = [];
        const links = [...document.querySelectorAll("a[href]")];
        const exempt = links.filter(inlineExempt);
        for (const a of exempt) {
          const href = a.getAttribute("href");
          const twin = links.some((b) => {
            if (b === a || b.getAttribute("href") !== href) return false;
            const r = b.getBoundingClientRect();
            return r.width >= 44 && r.height >= 44;
          });
          if (!twin) out.push(`no tap-sized twin for ${href}`);
          // Every point of this link's own text must hit this link.
          for (const rect of a.getClientRects()) {
            for (const fy of [0.2, 0.5, 0.8]) {
              const x = rect.left + rect.width / 2;
              const y = rect.top + rect.height * fy;
              const hit = document.elementFromPoint(x, y);
              if (hit && !a.contains(hit) && hit.closest("a") !== a) {
                out.push(
                  `${href} at ${fy}: hits ${hit.closest("a")?.getAttribute("href") ?? hit.tagName}`,
                );
              }
            }
          }
        }
        return out;
      }, isInlineSentenceLink.toString());
      expect(problems, `${width}px\n${problems.join("\n")}`).toEqual([]);
    }
  });
}

test("negative proof: the inline exception is narrow and overlap is caught", async ({
  page,
}) => {
  await page.setContent(`
    <p style="width:90px;font:16px/20px sans-serif">Try
      <a id="one" href="/a/" style="padding-block:14px">First</a> or
      <a id="two" href="/b/" style="padding-block:14px">Second</a> now.</p>
    <a id="block" href="/c/" style="display:inline-block">C</a>
    <p><a id="alone" href="/d/">Only link</a></p>`);
  const exempt = (id: string) =>
    page
      .locator(`#${id}`)
      .evaluate(
        (el, src) =>
          (new Function(`return ${src}`)() as (e: Element) => boolean)(el),
        isInlineSentenceLink.toString(),
      );
  expect(await exempt("one")).toBe(true);
  // A small block target and a link that is the whole paragraph stay checked.
  expect(await exempt("block")).toBe(false);
  expect(await exempt("alone")).toBe(false);
  // The padded second line covers the first link (the B-01 shape).
  const stolen = await page.evaluate(() => {
    const a = document.getElementById("one")!;
    const r = a.getClientRects()[0]!;
    const hit = document.elementFromPoint(
      r.left + r.width / 2,
      r.top + r.height * 0.8,
    );
    return hit?.closest("a")?.id ?? null;
  });
  expect(stolen).toBe("two");
});

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
