import { expect, test } from "@playwright/test";

// v5 W5.1: the served per-product card resolves, is a JPEG under the size
// ceiling and is exactly what the profile page advertises in every locale.
for (const lang of ["en", "vi", "zh", "zh-hant"]) {
  for (const slug of ["sotro", "sotam", "vungtaylai"]) {
    test(`${lang}/${slug} advertises its own served 1200x630 card`, async ({
      page,
      request,
    }) => {
      await page.goto(`/${lang}/products/${slug}/`);
      const og = await page
        .locator('meta[property="og:image"]')
        .getAttribute("content");
      expect(new URL(og!).pathname).toBe(`/social/products/${slug}.jpg`);
      await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
        "content",
        og!,
      );
      await expect(
        page.locator('meta[property="og:image:width"]'),
      ).toHaveAttribute("content", "1200");
      await expect(
        page.locator('meta[property="og:image:height"]'),
      ).toHaveAttribute("content", "630");
      const res = await request.get(new URL(og!).pathname);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/jpeg");
      const body = await res.body();
      expect(body.length).toBeLessThanOrEqual(150 * 1024);
      // JPEG SOF0/SOF2 marker carries height then width.
      let i = 2;
      while (i < body.length) {
        const marker = body[i + 1];
        if (marker === 0xc0 || marker === 0xc2) break;
        i += 2 + body.readUInt16BE(i + 2);
      }
      expect(body.readUInt16BE(i + 5)).toBe(630);
      expect(body.readUInt16BE(i + 7)).toBe(1200);
    });
  }
}
