import { test, expect, type Page } from "@playwright/test";

// SGPS-DEC-2026-037 HC-7 (Owner 2026-10-05): the appearance control is ONE
// icon in the header and in the compact menu. A press flips the resolved
// theme; pressing back to what the OS prefers returns to System and clears
// the stored choice. There is no popup list and there are no mode rows.

/** The visible theme icon: the header one, or the compact-menu one. */
async function themeIcon(page: Page) {
  const mobileMenu = page.locator("header details > summary");
  if (await mobileMenu.isVisible()) {
    const open = await page.locator("header details[open]").count();
    if (!open) await mobileMenu.click();
  }
  return page.locator("header [data-theme-trigger]:visible").first();
}

const stored = (page: Page) =>
  page.evaluate(() => localStorage.getItem("blueskyz-theme"));
const scheme = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);

test("theme storage is opt-in and the chosen theme survives navigation", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/en/");
  const icon = await themeIcon(page);
  await expect(icon).toHaveAttribute("aria-label", "Theme: System");
  expect(await stored(page)).toBeNull();

  await icon.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(icon).toHaveAttribute("aria-label", "Theme: Dark");
  expect(await stored(page)).toBe("dark");

  await page.goto("/vi/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(await themeIcon(page)).toHaveAttribute(
    "aria-label",
    "Giao diện: Tối",
  );
});

test("the compact menu shows one 44px icon, no mode rows", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/vi/");
  await page.locator("header details > summary").click();
  const row = page.locator("header .theme-control--menu");
  await expect(row).toBeVisible();
  await expect(row).toContainText("Giao diện");
  await expect(row.getByRole("button")).toHaveCount(1);
  await expect(page.locator("[data-theme-mode]")).toHaveCount(0);
  await expect(page.getByRole("group", { name: "Giao diện" })).toHaveCount(0);
  const icon = row.getByRole("button");
  const rect = await icon.boundingBox();
  expect(rect!.height).toBeGreaterThanOrEqual(44);
  expect(rect!.width).toBeGreaterThanOrEqual(44);
  await icon.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("on an OS-dark device a press pins Light and a second press returns to System", async ({
  browser,
}) => {
  const context = await browser.newContext({
    colorScheme: "dark",
    viewport: { width: 1280, height: 900 },
  });
  try {
    const page = await context.newPage();
    await page.goto("/en/");
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-theme",
      /light|dark/,
    );
    expect(await scheme(page)).toBe("dark");
    expect(await stored(page)).toBeNull();

    const icon = await themeIcon(page);
    await icon.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await scheme(page)).toBe("light");
    await page.goto("/en/about/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await stored(page)).toBe("light");

    // Back to what the OS prefers: System again, nothing stored.
    await (await themeIcon(page)).click();
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-theme",
      /light|dark/,
    );
    expect(await scheme(page)).toBe("dark");
    expect(await stored(page)).toBeNull();
    await expect(await themeIcon(page)).toHaveAttribute(
      "aria-label",
      "Theme: System",
    );
  } finally {
    await context.close();
  }
});

test("without JavaScript System still follows OS preference", async ({
  browser,
}) => {
  const context = await browser.newContext({
    colorScheme: "dark",
    javaScriptEnabled: false,
  });
  try {
    const page = await context.newPage();
    await page.goto("/en/");
    expect(await scheme(page)).toBe("dark");
    // The switcher options live in a native popover (closed without JS), so
    // assert the real links are present in the server HTML.
    await expect(
      page.locator('[data-language-choice="vi"]').first(),
    ).toBeAttached();
  } finally {
    await context.close();
  }
});

// The glyph shows the RESOLVED theme (sun / moon, read from the rays' computed
// opacity) and a cobalt dot marks System.
async function glyphState(page: Page): Promise<{
  rays: number;
  dot: number;
}> {
  return page.evaluate(() => {
    const svg = document.querySelector(
      "header [data-theme-trigger] .tt-morph",
    )!;
    const read = (sel: string) =>
      Number(getComputedStyle(svg.querySelector(sel)!).opacity);
    return { rays: read(".tt-rays"), dot: read(".tt-dot") };
  });
}

test("the desktop icon morphs on each press, names the theme and keeps it after a reload", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en/");
  const trigger = page.locator("header [data-theme-trigger]").first();
  await expect(trigger).toHaveAttribute("data-theme-current", "system");
  await expect(trigger).toHaveAttribute("aria-label", "Theme: System");
  await expect(trigger).not.toHaveAttribute("title", /.*/);
  await expect(trigger).not.toHaveAttribute("aria-expanded", /.*/);
  await expect(trigger).not.toHaveAttribute("popovertarget", /.*/);
  const box = await trigger.boundingBox();
  expect(Math.round(box!.width)).toBe(44);
  expect(Math.round(box!.height)).toBe(44);
  await expect(trigger.locator(".hc-chevron")).toHaveCount(0);
  // System on a light OS: sun + status dot.
  expect(await glyphState(page)).toEqual({ rays: 1, dot: 1 });
  // Mask ids are unique per instance (header + compact menu).
  const ids = await page.$$eval("mask[id]", (masks) => masks.map((m) => m.id));
  expect(ids.length).toBeGreaterThan(1);
  expect(new Set(ids).size).toBe(ids.length);

  // One press: dark at once, no popup, focus stays on the icon.
  await trigger.click();
  await expect(page.locator("[popover]:popover-open")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("data-theme-current", "dark");
  await expect(trigger).toHaveAttribute("aria-label", "Theme: Dark");
  expect(await glyphState(page)).toEqual({ rays: 0, dot: 0 });

  await page.reload();
  await expect(trigger).toHaveAttribute("aria-label", "Theme: Dark");
  expect(await glyphState(page)).toEqual({ rays: 0, dot: 0 });

  // Press back to the OS theme: System, sun + dot, nothing stored.
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-label", "Theme: System");
  expect(await glyphState(page)).toEqual({ rays: 1, dot: 1 });
  expect(await stored(page)).toBeNull();
});

test("System on an OS-dark device shows the moon with the status dot", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en/");
  await expect(
    page.locator("header [data-theme-trigger]").first(),
  ).toHaveAttribute("aria-label", "Theme: System");
  expect(await glyphState(page)).toEqual({ rays: 0, dot: 1 });
});

test("the tooltip names the theme on hover and keyboard focus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/vi/");
  const trigger = page.locator("header [data-theme-trigger]").first();
  const tip = trigger.locator("[data-theme-tip]");
  await expect(tip).toHaveAttribute("aria-hidden", "true");
  await expect(tip).toBeHidden();
  // The hover tooltip exists only for hover-capable pointers (@media
  // (hover: hover)); touch devices (mobile project) must NOT show it on tap.
  const canHover = await page.evaluate(
    () => matchMedia("(hover: hover)").matches,
  );
  await trigger.hover();
  if (canHover) {
    await expect(tip).toBeVisible();
    // innerText: only the current mode's word is rendered (display).
    await expect.poll(() => tip.innerText()).toBe("Giao diện: Tự động");
  } else {
    await expect(tip).toBeHidden();
  }
  // The tooltip never widens the page.
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  await page.mouse.move(10, 600);
  // Keyboard: focus shows the tooltip; Enter flips the theme and the tooltip
  // follows it.
  await trigger.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(trigger).toBeFocused();
  await expect(tip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect.poll(() => tip.innerText()).toBe("Giao diện: Tối");
  await expect(trigger).toHaveAttribute("aria-label", "Giao diện: Tối");
});

test("below lg the icon trigger keeps its accessible name", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1023, height: 800 });
  await page.goto("/vi/");
  const trigger = page.locator("header [data-theme-trigger]").first();
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-label", "Giao diện: Tự động");
});
