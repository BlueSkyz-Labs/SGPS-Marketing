import { expect, test } from "@playwright/test";
import { gitLastmod, lastmodForPath } from "../../src/lib/git-lastmod";
import { lastUpdatedView } from "../../src/lib/last-updated";

/**
 * UX P2-10 (A9): the "Last updated" line must equal the sitemap <lastmod> for
 * the same URL and must be absent when there is no lastmod (shallow clone).
 */
const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;
const LABEL: Record<(typeof LOCALES)[number], string> = {
  en: "Last updated",
  vi: "Cập nhật lần cuối",
  zh: "最后更新",
  "zh-hant": "最後更新",
};
const TRUST = ["about", "verify", "privacy", "security"];

async function sitemapLastmods(
  request: import("@playwright/test").APIRequestContext,
) {
  const xml = await (await request.get("/sitemap.xml")).text();
  const map = new Map<string, string | undefined>();
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>(.*?)<\/loc>/.exec(m[1])?.[1];
    if (!loc) continue;
    map.set(new URL(loc).pathname, /<lastmod>(.*?)<\/lastmod>/.exec(m[1])?.[1]);
  }
  return map;
}

test.describe("UX P2-10 last updated line", () => {
  test("line matches the sitemap lastmod, or is absent without one", async ({
    page,
    request,
  }) => {
    const lastmods = await sitemapLastmods(request);
    // The sitemap is deliberately empty on non-production origins (truth
    // guard); then compare against the same git resolver the sitemap uses.
    const sitemapPopulated = lastmods.size > 0;
    const slug = (await (await request.get("/en/products/")).text()).match(
      /href="\/en\/products\/([a-z0-9-]+)\/"/,
    )?.[1];
    expect(slug, "a product profile link").toBeTruthy();
    let checked = 0;
    for (const lang of LOCALES) {
      const paths = [
        ...TRUST.map((t) => `/${lang}/${t}/`),
        `/${lang}/products/${slug}/`,
      ];
      for (const path of paths) {
        await page.goto(path);
        const line = page.locator("[data-last-updated]");
        const expected = sitemapPopulated
          ? lastmods.get(path)
          : lastmodForPath(path);
        if (expected) {
          await expect(line, path).toHaveCount(1);
          await expect(line.locator("time")).toHaveAttribute(
            "datetime",
            expected,
          );
          await expect(line).toContainText(LABEL[lang]);
          checked += 1;
        } else {
          await expect(line, `${path} has no lastmod`).toHaveCount(0);
        }
      }
    }
    // Environment note: a shallow checkout legitimately yields zero lines.
    console.log(`last-updated lines verified against sitemap: ${checked}`);
  });

  test("renders nothing for pages that did not opt in", async ({ page }) => {
    await page.goto("/en/support/");
    await expect(page.locator("[data-last-updated]")).toHaveCount(0);
  });

  test("negative proof: no lastmod renders no line, never a placeholder", () => {
    expect(lastUpdatedView(undefined, "en")).toBeNull();
    // A shallow clone makes the real resolver return undefined.
    const shallowRunner = (args: string[]) =>
      args[0] === "rev-parse" ? "true" : "2026-10-01";
    const date = gitLastmod(["src/pages/en/about.astro"], {
      run: shallowRunner,
      today: "2026-10-13",
    });
    expect(date).toBeUndefined();
    expect(lastUpdatedView(date, "vi")).toBeNull();
    // And the positive control: a full clone yields a date and a view.
    const full = gitLastmod(["src/pages/en/about.astro"], {
      run: (a) => (a[0] === "rev-parse" ? "false" : "2026-10-01"),
      today: "2026-10-13",
    });
    expect(lastUpdatedView(full, "zh-hant")).toMatchObject({
      label: "最後更新",
      datetime: "2026-10-01",
    });
  });
});
