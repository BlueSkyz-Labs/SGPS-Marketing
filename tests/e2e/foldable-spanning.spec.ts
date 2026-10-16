import { expect, test } from "@playwright/test";

const ROUTES = ["en", "vi", "zh", "zh-hant"].flatMap((locale) => [
  `/${locale}/`,
  `/${locale}/about/`,
  `/${locale}/products/`,
  `/${locale}/products/sotro/`,
  `/${locale}/products/sotam/`,
]);

for (const route of ROUTES) {
  test(`${route} keeps reading content clear of a simulated fold`, async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "fold posture is emulated through CDP",
    );

    const viewport = { width: 1200, height: 800 };
    const fold = { offset: 590, width: 20 };
    await page.setViewportSize(viewport);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      ...viewport,
      deviceScaleFactor: 1,
      mobile: true,
      screenWidth: viewport.width,
      screenHeight: viewport.height,
      displayFeature: {
        orientation: "vertical",
        offset: fold.offset,
        maskLength: fold.width,
      },
      devicePosture: { type: "folded" },
    });
    await cdp.send("Emulation.setDisplayFeaturesOverride", {
      features: [
        {
          orientation: "vertical",
          offset: fold.offset,
          maskLength: fold.width,
        },
      ],
    });
    await cdp.send("Emulation.setDevicePostureOverride", {
      posture: { type: "folded" },
    });

    await page.goto(route);
    const result = await page.evaluate(() => {
      const featureActive = matchMedia(
        "(horizontal-viewport-segments: 2)",
      ).matches;
      const getWindowSegments = (
        window as Window & { getWindowSegments?: () => DOMRect[] }
      ).getWindowSegments;
      const segments = getWindowSegments?.().map(({ x, y, width, height }) => ({
        x,
        y,
        width,
        height,
      }));
      const foldStart = 590;
      const foldEnd = 610;
      const crossing = [
        ...document.querySelectorAll<HTMLElement>(
          "main h1, main h2, main h3, main p, main a, main button, main li, main input, main select, main textarea",
        ),
      ]
        .filter((element) => {
          const style = getComputedStyle(element);
          if (style.display === "none" || style.visibility === "hidden") {
            return false;
          }
          const rect = element.getBoundingClientRect();
          return (
            rect.width > 0 && rect.left < foldEnd && rect.right > foldStart
          );
        })
        .map((element) => ({
          tag: element.tagName.toLowerCase(),
          text: element.textContent?.trim().slice(0, 80),
          className: element.className,
          left: Math.round(element.getBoundingClientRect().left),
          right: Math.round(element.getBoundingClientRect().right),
        }));
      return { featureActive, crossing, segments, innerWidth };
    });

    expect(result.featureActive, JSON.stringify(result)).toBe(true);
    expect(result.crossing, "content must not sit beneath the hinge").toEqual(
      [],
    );
    await cdp.detach();
  });
}
