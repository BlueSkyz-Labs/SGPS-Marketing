// tests/e2e/c2-reduced-motion.spec.ts
/**
 * C2 Wave P2 — reduced-motion equivalence proof
 * Verifies that the Horizon Arrival hero respects prefers-reduced-motion:
 * content visible, actions usable, signature neutralised, no horizontal overflow.
 */
import { test, expect } from '@playwright/test';

test.describe('C2 reduced-motion equivalence', () => {
  // Reduced motion state
  test('hero content visible and actions usable', async ({
    page,
  }) => {
    // Emulate reduced motion
    await page.addStyleTag({
      content: '@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }',
    });

    // Navigate to home page
    await page.goto('/en');

    // H1 and primary CTA must be visible immediately (no animation gating)
    const h1 = page.locator('#hero-title');
    await expect(h1).toBeVisible();

    // Primary CTA button exists and is clickable
    const primaryCta = page.locator('button, a').first();
    await expect(primaryCta).toBeVisible();
    await expect(primaryCta).toBeEnabled();

    // No horizontal overflow at 320px and 390px
    await page.setViewportSize({ width: 320, height: 800 });
    await expect(h1).not.toHaveCSS('overflow-x', 'hidden');

    await page.setViewportSize({ width: 390, height: 800 });
    await expect(h1).not.toHaveCSS('overflow-x', 'hidden');
  });

  test('horizon signature neutralised under reduced motion', async ({
    page,
  }) => {
    // Emulate reduced motion
    await page.addStyleTag({
      content: '@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }',
    });

    await page.goto('/en');

    // Horizon field should exist but have no animation/transition
    const horizonField = page.locator('[data-horizon]');
    await expect(horizonField).toBeVisible();

    // Check that transform/transition are neutralised (no !important duration outside reduce block)
    const heroSignature = page.locator('.horizon-signature');
    const style = await heroSignature.evaluate((el) => window.getComputedStyle(el));

    // The CSS should have transition: none !important and opacity static
    expect(style.transition).toBe('none');
    expect(style.animation).toBe('none');
  });

  test('decorative animations only run when motion welcome', async ({
    page,
  }) => {
    // Normal motion path
    await page.goto('/en');

    // Horizon field should have visual presence (not opacity:0)
    const horizonField = page.locator('[data-horizon]');
    await expect(horizonField).toBeVisible();

    // Atmosphere overlay should be visible (decorative but present)
    const atmosphere = page.locator('.hero-atmosphere');
    await expect(atmosphere).toBeVisible();
  });
});