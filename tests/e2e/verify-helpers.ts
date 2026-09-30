import type { Page } from "@playwright/test";

export type VerifyLayer = "atlas" | "trace" | "pages";

/**
 * Open a /verify route and expand one collapsed technical layer with a real
 * click on its native <summary> (works with JavaScript disabled too).
 */
export async function openVerifyLayer(
  page: Page,
  path: string,
  layer: VerifyLayer,
): Promise<void> {
  await page.goto(path);
  const details = page.locator(`details[data-verify-layer="${layer}"]`);
  await details.locator("summary").first().click();
  // Park the pointer so hover-driven Atlas emphasis does not leak into tests.
  await page.mouse.move(0, 0);
}
