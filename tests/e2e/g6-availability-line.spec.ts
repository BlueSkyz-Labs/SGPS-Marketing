import { expect, test, type Page } from "@playwright/test";

/**
 * G6 / ACQ-03 / ACQ-11 (Owner 2026-10-20): a product profile has ONE
 * availability line (the Availability line plus the contact sentence), no
 * separate prose paragraph, a de-emphasised stage row, and the Sổ Tâm card chip
 * says "Web · in development".
 */
const LANGS = ["en", "vi", "zh", "zh-hant"] as const;
type Lang = (typeof LANGS)[number];
const SLUGS = ["sotro", "sotam"] as const;

// Every string here already exists in product-page-copy.ts (AVAILABILITY and
// the contact clause of the preview note); only their arrangement is new.
const LINE: Record<Lang, Record<(typeof SLUGS)[number], string>> = {
  en: {
    sotro:
      "Web: open preview, limited places · Android and iOS: in development. Questions? Get in touch.",
    sotam:
      "Web: in development · Android and iOS: in development. Questions? Get in touch.",
  },
  vi: {
    sotro:
      "Web: bản xem trước đã mở, số chỗ có hạn · Android và iOS: đang phát triển. Cần hỏi thêm? Liên hệ với chúng tôi.",
    sotam:
      "Web: đang phát triển · Android và iOS: đang phát triển. Cần hỏi thêm? Liên hệ với chúng tôi.",
  },
  zh: {
    sotro:
      "网页：预览版已开放，名额有限 · Android 与 iOS：开发中。有疑问？与我们联系。",
    sotam: "网页：开发中 · Android 与 iOS：开发中。有疑问？与我们联系。",
  },
  "zh-hant": {
    sotro:
      "網頁：預覽版已開放，名額有限 · Android 與 iOS：開發中。有疑問？與我們聯絡。",
    sotam: "網頁：開發中 · Android 與 iOS：開發中。有疑問？與我們聯絡。",
  },
};

const OLD_PROSE =
  /Not yet open for sign-up|The web preview is open to a limited|Chưa mở đăng ký|Bản xem trước trên web đã mở cho|目前尚未開?放|網頁預覽版已向|网页预览版已向/;

const CHIP: Record<Lang, string> = {
  en: "Web · in development",
  vi: "Web · đang phát triển",
  zh: "网页 · 开发中",
  "zh-hant": "網頁 · 開發中",
};

/** Violations of the one-line contract on a product profile (empty = pass). */
async function lineViolations(page: Page, lang: Lang, expected: string) {
  return page.evaluate(
    ({ lang, expected, oldProse }) => {
      const out: string[] = [];
      const norm = (s: string) => s.replace(/\s+/g, " ").trim();
      const lines = document.querySelectorAll("[data-app-access]");
      if (lines.length !== 1) out.push(`${lines.length} availability lines`);
      const line = lines[0] as HTMLElement | undefined;
      if (line && norm(line.innerText) !== expected)
        out.push(`line text: ${norm(line.innerText)}`);
      const link = line?.querySelector("a");
      if (!link || link.getAttribute("href") !== `/${lang}/contact/`)
        out.push("contact link missing from the line");
      const prose = [...document.querySelectorAll("main p")].filter(
        (p) =>
          p !== line &&
          (new RegExp(oldProse).test(p.textContent ?? "") ||
            /Android/.test(p.textContent ?? "")),
      );
      if (prose.length > 0) out.push(`${prose.length} prose paragraph(s)`);
      if (document.querySelectorAll("p[data-interim-note]").length > 0)
        out.push("separate interim paragraph");
      return out;
    },
    { lang, expected, oldProse: OLD_PROSE.source },
  );
}

/** Computed de-emphasis and AA contrast of the stage row (empty = pass). */
async function stageViolations(page: Page) {
  return page.evaluate(() => {
    const out: string[] = [];
    const row = document.querySelector<HTMLElement>(".product-ladder__summary");
    const strong = row?.querySelector<HTMLElement>("strong");
    const line = document.querySelector<HTMLElement>("[data-app-access]");
    if (!row || !strong || !line) return ["stage row or line missing"];
    const probe = document.createElement("span");
    probe.style.color = "var(--text-muted)";
    document.body.append(probe);
    const muted = getComputedStyle(probe).color;
    probe.remove();
    const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!);
    };
    let el: HTMLElement | null = row;
    let bg = [255, 255, 255];
    while (el) {
      const c = rgb(getComputedStyle(el).backgroundColor);
      if (c.length >= 3 && (c[3] ?? 1) > 0.99) {
        bg = c;
        break;
      }
      el = el.parentElement;
    }
    for (const node of [row, strong]) {
      const cs = getComputedStyle(node);
      if (cs.color !== muted) out.push(`colour ${cs.color} is not muted`);
      const a = lum(rgb(cs.color));
      const b = lum(bg);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      if (ratio < 4.5) out.push(`contrast ${ratio.toFixed(2)} < 4.5`);
    }
    if (
      parseFloat(getComputedStyle(row).fontSize) >=
      parseFloat(getComputedStyle(line).fontSize)
    )
      out.push("stage row is not smaller than the availability line");
    if (!document.querySelector("[data-product-status]"))
      out.push("stage badge removed");
    return out;
  }) as Promise<string[]>;
}

async function chipText(page: Page, slug: string) {
  return page
    .locator(`article[data-product-card]:has(a[href$="/products/${slug}/"])`)
    .first()
    .locator('[role="group"] span')
    .first()
    .innerText();
}

for (const lang of LANGS) {
  for (const slug of SLUGS) {
    test(`/${lang}/products/${slug}/ has one availability line with the contact link`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/products/${slug}/`);
      expect(await lineViolations(page, lang, LINE[lang][slug])).toEqual([]);
    });

    for (const scheme of ["light", "dark"] as const) {
      test(`/${lang}/products/${slug}/ stage row is muted, small and AA (${scheme})`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(`/${lang}/products/${slug}/`);
        await expect(page.locator("[data-product-ladder]")).toHaveCount(1);
        expect(await stageViolations(page)).toEqual([]);
      });
    }
  }

  test(`/${lang}/products/ Sổ Tâm chip reads "${CHIP[lang]}", Sổ Trọ stays "Web"`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/products/`);
    expect((await chipText(page, "sotam")).trim()).toBe(CHIP[lang]);
    expect((await chipText(page, "sotro")).trim()).toBe(
      CHIP[lang].split(" · ")[0],
    );
  });
}

test.describe("negative proofs (the same predicates, invariant broken live)", () => {
  test("a second prose paragraph, or a removed contact link, is caught", async ({
    page,
  }) => {
    await page.goto("/vi/products/sotro/");
    expect(await lineViolations(page, "vi", LINE.vi.sotro)).toEqual([]);
    await page.evaluate(() => {
      const p = document.createElement("p");
      p.setAttribute("data-interim-note", "");
      p.textContent =
        "Bản xem trước trên web đã mở cho một số chủ trọ; ứng dụng Android và iOS vẫn đang phát triển.";
      document.querySelector("[data-app-access]")!.after(p);
      document.querySelector("[data-app-access] a")!.remove();
    });
    const v = await lineViolations(page, "vi", LINE.vi.sotro);
    expect(v).toEqual(
      expect.arrayContaining([
        "contact link missing from the line",
        "1 prose paragraph(s)",
        "separate interim paragraph",
      ]),
    );
  });

  test("a second availability line is caught", async ({ page }) => {
    await page.goto("/en/products/sotam/");
    await page.evaluate(() => {
      const l = document.querySelector("[data-app-access]")!;
      l.after(l.cloneNode(true));
    });
    expect(await lineViolations(page, "en", LINE.en.sotam)).toContain(
      "2 availability lines",
    );
  });

  test("a full-size, non-muted stage row is caught", async ({ page }) => {
    await page.goto("/vi/products/sotro/");
    expect(await stageViolations(page)).toEqual([]);
    await page.addStyleTag({
      content:
        ".product-ladder__summary,.product-ladder__summary strong{font-size:1rem!important;color:var(--text-primary)!important}",
    });
    const v = await stageViolations(page);
    expect(v.some((m) => m.includes("is not muted"))).toBe(true);
    expect(v).toContain("stage row is not smaller than the availability line");
  });

  test("a stage row below AA contrast is caught", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/vi/products/sotro/");
    await page.addStyleTag({
      content:
        ".product-ladder__summary,.product-ladder__summary strong{color:#cbd5e1!important}",
    });
    expect(
      (await stageViolations(page)).some((m) => m.includes("contrast")),
    ).toBe(true);
  });

  test("a restored plain Web chip is caught", async ({ page }) => {
    await page.goto("/vi/products/");
    expect((await chipText(page, "sotam")).trim()).toBe(CHIP.vi);
    await page
      .locator('article[data-product-card]:has(a[href$="/products/sotam/"])')
      .first()
      .locator('[role="group"] span')
      .first()
      .evaluate((el) => (el.textContent = "Web"));
    expect((await chipText(page, "sotam")).trim()).not.toBe(CHIP.vi);
  });
});
