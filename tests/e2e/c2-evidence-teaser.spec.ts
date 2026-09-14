import { expect, test, type TestInfo } from "@playwright/test";
import { readFileSync } from "node:fs";

/**
 * C2 P4 — compact EvidenceTeaser contract (homepage meaning/trust act).
 *
 * The component is fail-closed: with nothing publishable it renders nothing,
 * so absence is a legal state and every test below stays honest in both
 * states:
 *
 *   - mounted: the disclosure, its deep links, its bilingual labels, and its
 *     assurance-language boundary are asserted in the browser;
 *   - absent: the absence itself is asserted (no hollow shell, no orphan
 *     item) and annotated, so a green run can never be misread as "the teaser
 *     rendered";
 *   - the static canon probe at the end holds in both states and is what
 *     keeps the browser contract from degrading into a vacuous no-op while
 *     the homepage host has not imported the component yet.
 *
 * Nothing here authors claim, evidence, or review content: every expected
 * value is either a reused canonical label or the canonical route shape
 * `/<lang>/evidence/<canonical-claim-id>/`.
 */

const TEASER = "[data-evidence-teaser]";
const ITEM = "[data-evidence-teaser-item]";
const PASSPORT_LINK = "[data-evidence-teaser-passport]";

const LOCALES = [
  {
    lang: "en",
    home: "/en/",
    more: "See the evidence",
    passport: "Evidence passport",
  },
  {
    lang: "vi",
    home: "/vi/",
    more: "Xem bằng chứng",
    passport: "Hộ chiếu bằng chứng",
  },
] as const;

/** Canonical deeper surface: an evidence passport or a trust route. */
const DEEP_SURFACE =
  /^\/(en|vi)\/(evidence\/[a-z0-9-]+\/|privacy\/|security\/|support\/|products\/|decision-room\/)$/;

/**
 * Assurance vocabulary no public state may imply. This is the same ban the
 * canonical model declares in `NEVER_IMPLIED_BY_ANY_STATE`
 * (`src/lib/public-state-semantics.ts`); the architecture guard
 * `tests/architecture/public-assurance-language.test.mjs` keeps that model and
 * this list aligned.
 */
const BANNED_ASSURANCE =
  /\b(trust score|risk score|certified|audited|compliant|guaranteed|secure|verified[ -]?by[ -]?us)\b/i;

const COMPONENT_SOURCE = readFileSync(
  new URL(
    "../../src/components/integrity/EvidenceTeaser.astro",
    import.meta.url,
  ),
  "utf8",
);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function annotateAbsent(testInfo: TestInfo, route: string): void {
  testInfo.annotations.push({
    type: "teaser-absent",
    description: `${route} publishes no evidence teaser — either nothing is publishable (fail-closed) or the host section does not mount the component yet`,
  });
}

test.describe("C2 compact evidence teaser", () => {
  for (const locale of LOCALES) {
    test(`${locale.home} teaser is truthful when mounted and never an empty shell`, async ({
      page,
    }, testInfo) => {
      await page.goto(locale.home);

      if ((await page.locator(TEASER).count()) === 0) {
        // Fail-closed absence: no container, therefore no orphan item either.
        await expect(page.locator(ITEM)).toHaveCount(0);
        annotateAbsent(testInfo, locale.home);
        return;
      }

      await expect(page.locator(TEASER)).toHaveCount(1);
      const itemCount = await page.locator(ITEM).count();
      expect(
        itemCount,
        "a mounted teaser carries at least one claim",
      ).toBeGreaterThan(0);

      for (let index = 0; index < itemCount; index += 1) {
        const item = page.locator(ITEM).nth(index);
        const claimId = await item.getAttribute("data-claim-id");
        expect(
          claimId,
          "each teaser item is bound to a canonical claim id",
        ).toMatch(/^[a-z0-9-]+$/);

        // (b) never an empty shell: a mounted item always links out.
        const links = item.locator("a");
        expect(
          await links.count(),
          `${claimId} must expose at least one destination`,
        ).toBeGreaterThan(0);

        // (a) at least one canonical deeper surface.
        const hrefs = await links.evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("href") ?? ""),
        );
        const deep = hrefs.filter((href) => DEEP_SURFACE.test(href));
        expect(
          deep.length,
          `${claimId} must link to an evidence passport or trust route (found ${JSON.stringify(hrefs)})`,
        ).toBeGreaterThan(0);

        // The passport deep link is the claim's own canonical route.
        await expect(item.locator(PASSPORT_LINK)).toHaveAttribute(
          "href",
          `/${locale.lang}/evidence/${claimId}/`,
        );

        // Canonical record text plus the reused bilingual label only.
        await expect(item.locator("h3")).toHaveText(/\S/);
        await expect(item.locator("summary")).toHaveText(locale.more);

        // (c) no invented assurance vocabulary anywhere in the item, including
        // the collapsed reveal (textContent, not innerText).
        const text = await item.evaluate((node) => node.textContent ?? "");
        expect(text).not.toMatch(BANNED_ASSURANCE);
      }
    });

    test(`${locale.home} passport deep link resolves to the canonical evidence surface`, async ({
      page,
    }, testInfo) => {
      await page.goto(locale.home);
      const first = page.locator(ITEM).first();

      if ((await first.count()) === 0) {
        annotateAbsent(testInfo, locale.home);
        return;
      }

      await first.locator("summary").click();
      await expect(first.locator("details")).toHaveAttribute("open", "");

      const passport = first.locator(PASSPORT_LINK);
      await expect(passport).toBeVisible();
      const href = (await passport.getAttribute("href")) ?? "";
      expect(href).toMatch(DEEP_SURFACE);

      await passport.click();
      await expect(page).toHaveURL(new RegExp(`${escapeRegExp(href)}$`));
      await expect(page.locator("[data-evidence-passport]")).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 1, name: locale.passport }),
      ).toBeVisible();
    });

    test(`${locale.home} disclosure opens from the keyboard`, async ({
      page,
    }, testInfo) => {
      await page.goto(locale.home);
      const first = page.locator(ITEM).first();

      if ((await first.count()) === 0) {
        annotateAbsent(testInfo, locale.home);
        return;
      }

      const summary = first.locator("summary");
      await summary.focus();
      await expect(summary).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(first.locator("details")).toHaveAttribute("open", "");
      await expect(first.locator(PASSPORT_LINK)).toBeVisible();
    });
  }
});

test.describe("C2 compact evidence teaser without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  for (const locale of LOCALES) {
    test(`${locale.home} disclosure and its links work with JavaScript disabled`, async ({
      page,
    }, testInfo) => {
      await page.goto(locale.home);
      const first = page.locator(ITEM).first();

      if ((await first.count()) === 0) {
        await expect(page.locator(TEASER)).toHaveCount(0);
        annotateAbsent(testInfo, locale.home);
        return;
      }

      // Native disclosure: no script involved in opening it.
      await first.locator("summary").click();
      await expect(first.locator("details")).toHaveAttribute("open", "");

      const passport = first.locator(PASSPORT_LINK);
      await expect(passport).toBeVisible();
      await passport.click();
      await expect(page.locator("[data-evidence-passport]")).toBeVisible();
    });
  }
});

test.describe("C2 compact evidence teaser canon", () => {
  test("consumes canonical selectors and authors no claim/evidence copy", () => {
    expect(COMPONENT_SOURCE).toMatch(/from "@\/lib\/claims"/);
    expect(COMPONENT_SOURCE).toMatch(/getEvidencePassport/);
    expect(COMPONENT_SOURCE).toMatch(/getEvidencePassportPath/);

    // No second registry: no evidence id list, no authored review date.
    expect(COMPONENT_SOURCE).not.toMatch(/evidenceIds\s*:/);
    expect(COMPONENT_SOURCE).not.toMatch(/reviewedOn/);

    // Static-first: no hydration directive, no hardcoded locale path.
    expect(COMPONENT_SOURCE).not.toMatch(
      /client:(load|idle|visible|media|only)/,
    );
    expect(COMPONENT_SOURCE).not.toMatch(/href="\/(en|vi)\//);

    // (c) holds in source too, so the ban is enforced while unwired.
    expect(COMPONENT_SOURCE).not.toMatch(BANNED_ASSURANCE);

    // Fail-closed branch is present: nothing publishable renders nothing.
    expect(COMPONENT_SOURCE).toMatch(/\)\s*:\s*null/);
  });
});
