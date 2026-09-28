import { expect, test } from "@playwright/test";

test("mobile skips the hero image; desktop loads the Prismatic R4d mark", async ({
  page,
}) => {
  const heroImageRequests: string[] = [];
  page.on("request", (request) => {
    if (/\/brand\/blueskyz\/v4\/hero\//.test(request.url())) {
      heroImageRequests.push(new URL(request.url()).pathname);
    }
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/vi/");
  const heroImage = page.locator(".hero-mark");
  await expect(heroImage).toHaveCount(1);
  expect(
    await heroImage.evaluate((image: HTMLImageElement) => image.currentSrc),
  ).toMatch(/^data:/);
  expect(heroImageRequests).toEqual([]);

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect
    .poll(() =>
      heroImage.evaluate((image: HTMLImageElement) => image.currentSrc),
    )
    .toMatch(/\/prismatic-r4d-mark-(560|840)\.(avif|webp)$/);
  await expect
    .poll(() =>
      heroImage.evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
    )
    .toBe(true);
  expect(
    heroImageRequests.some((path) => /prismatic-r4d-mark-/.test(path)),
  ).toBe(true);
  expect(heroImageRequests.some((path) => /website_hero_/.test(path))).toBe(
    false,
  );

  const hasInfiniteHeroMotion = await page
    .locator(".hero-visual")
    .evaluate((visual) =>
      [visual, ...visual.querySelectorAll("*")].some((element) => {
        const style = getComputedStyle(element);
        return (
          style.animationName !== "none" &&
          style.animationIterationCount === "infinite"
        );
      }),
    );
  expect(hasInfiniteHeroMotion).toBe(false);
});
