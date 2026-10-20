import { expect, test, type Page } from "@playwright/test";

/**
 * TRU-10 (Owner 2026-10-20): Vietnamese jargon is glossed once, on its first
 * visible use per page, and EN visible labels say "page" rather than "route".
 */
const GLOSSED = [
  ["issue công khai", "mục báo lỗi công khai trên GitHub"],
  ["GitHub security advisories", "kênh báo lỗ hổng riêng tư của GitHub"],
  ["người bảo trì", "người quản lý kho mã nguồn trên GitHub"],
  ["header yêu cầu", "thông tin kỹ thuật trình duyệt tự gửi kèm"],
] as const;

const VI_PAGES = [
  "/vi/contact/",
  "/vi/security/",
  "/vi/privacy/",
  "/vi/verify/",
  "/vi/decision-room/",
  "/vi/dossier/",
  "/vi/dossier/print/",
  "/vi/evidence/security-reporting-is-private/",
  "/vi/editions/trust-foundations/",
  "/vi/",
  "/vi/products/",
  "/vi/about/",
] as const;

const EN_PAGES = [
  "/en/privacy/",
  "/en/dossier/",
  "/en/decision-room/",
  "/en/verify/",
] as const;

/** Predicate shared by the positive tests and the negative proofs. */
async function glossViolations(page: Page): Promise<string[]> {
  return page.evaluate((terms) => {
    for (const d of document.querySelectorAll("details")) d.open = true;
    const text = document.body.innerText;
    const out: string[] = [];
    for (const [term, gloss] of terms) {
      const glossed = `${term} (${gloss})`;
      const first = text.indexOf(term);
      if (first < 0) continue;
      const count = text.split(glossed).length - 1;
      if (count !== 1) out.push(`${term}: gloss appears ${count}x, want 1`);
      else if (text.indexOf(glossed) !== first)
        out.push(`${term}: used before its gloss`);
    }
    return out;
  }, GLOSSED);
}

const routeLabel = (page: Page) =>
  page.evaluate(
    () =>
      /(Privacy|Security reporting|Products) route\b/.exec(
        document.body.innerText,
      )?.[0] ?? null,
  );

test.describe("TRU-10 VI glossary: once, on first use", () => {
  for (const route of VI_PAGES) {
    test(`${route} glosses each term once, before any other use`, async ({
      page,
    }) => {
      await page.goto(route);
      expect(await glossViolations(page)).toEqual([]);
    });
  }

  test("the glossed terms are actually exercised (not a vacuous pass)", async ({
    page,
  }) => {
    const seen = new Set<string>();
    for (const route of VI_PAGES) {
      await page.goto(route);
      const present = await page.evaluate(
        (terms) =>
          terms
            .filter(([t, g]) => document.body.innerText.includes(`${t} (${g})`))
            .map(([t]) => t),
        GLOSSED,
      );
      present.forEach((t) => seen.add(t));
    }
    expect([...seen].sort()).toEqual(GLOSSED.map(([t]) => t).sort());
  });

  test("negative proof: an earlier unglossed use, or a repeated gloss, is caught", async ({
    page,
  }) => {
    await page.goto("/vi/security/");
    expect(await glossViolations(page)).toEqual([]);
    await page.evaluate(() => {
      const p = document.createElement("p");
      p.textContent = "người bảo trì";
      document.body.prepend(p);
    });
    expect(await glossViolations(page)).toEqual([
      expect.stringContaining("người bảo trì"),
    ]);
    await page.goto("/vi/security/");
    await page.evaluate(() => {
      const p = document.createElement("p");
      p.textContent =
        "issue công khai (mục báo lỗi công khai trên GitHub) lặp lại";
      document.body.append(p);
    });
    expect(await glossViolations(page)).toEqual([
      expect.stringContaining("issue công khai: gloss appears 2x"),
    ]);
  });
});

test.describe("TRU-10 EN labels say page, not route", () => {
  for (const route of EN_PAGES) {
    test(`${route} has no "Privacy/Security reporting/Products route" label`, async ({
      page,
    }) => {
      await page.goto(route);
      expect(await routeLabel(page)).toBeNull();
    });
  }

  test("the renamed labels are visible somewhere", async ({ page }) => {
    await page.goto("/en/privacy/");
    await expect(page.getByText("Privacy page", { exact: true })).toBeVisible();
    await page.goto("/en/dossier/");
    const text = await page.evaluate(() => document.body.innerText);
    expect(text).toContain("Security reporting page");
    expect(text).toContain("Products page");
  });

  test("negative proof: a restored legacy label is caught", async ({
    page,
  }) => {
    await page.goto("/en/privacy/");
    expect(await routeLabel(page)).toBeNull();
    await page.evaluate(() => {
      const s = document.createElement("span");
      s.textContent = "Products route";
      document.body.append(s);
    });
    expect(await routeLabel(page)).toBe("Products route");
  });
});
