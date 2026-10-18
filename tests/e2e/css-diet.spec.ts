import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

/**
 * CSS diet (audit D-05 / D-06).
 *
 * Reads the built `dist/` HTML (run `astro build` first, as the preview server
 * does). Scope: `dist/<locale>/index.html` and `dist/<locale>/products/index.html`
 * and the stylesheets they link. It does not execute a browser.
 *
 *  - D-06: the home never links the ProductCard stylesheet (the compact home
 *    renders product rows, not cards) and no page links a stylesheet chunk named
 *    after ProofFirstEmptyState.
 *  - D-05: rules owned by unrendered components stay out of the global bundle.
 */

const DIST = join(process.cwd(), "dist");
const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;

/** Classes whose rules now live with their owning component. */
const MOVED_CLASSES = [
  "experience-spine",
  "intent-chip",
  "bilingual-mirror__",
  "c4-dossier-sources",
  "c4-provenance",
  "c4-craft",
  "c4-maison",
  "c4-folio",
];

type CssReader = (href: string) => string;

const readDistCss: CssReader = (href) =>
  readFileSync(join(DIST, href.replace(/^\//, "")), "utf8");

export function linkedStylesheets(html: string): string[] {
  return [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*>/g)]
    .map((m) => /href="([^"]*)"/.exec(m[0])?.[1])
    .filter((href): href is string => Boolean(href));
}

/** Violations for a page that must not ship card or empty-state CSS. */
export function auditHomeStylesheets(html: string, read: CssReader): string[] {
  const out: string[] = [];
  for (const href of linkedStylesheets(html)) {
    if (/ProofFirstEmptyState/.test(href))
      out.push(`empty-state sheet ${href}`);
    const css = read(href);
    if (/\.product-card|\.product-thumb/.test(css)) {
      out.push(`card styles in ${href}`);
    }
  }
  return out;
}

export function auditGlobalBundle(css: string): string[] {
  return MOVED_CLASSES.filter((c) => css.includes(`.${c}`)).map(
    (c) => `.${c} in global bundle`,
  );
}

test.describe("CSS diet (D-05, D-06)", () => {
  for (const lang of LOCALES) {
    test(`${lang} home links no card or empty-state stylesheet`, () => {
      const html = readFileSync(join(DIST, lang, "index.html"), "utf8");
      expect(auditHomeStylesheets(html, readDistCss)).toEqual([]);
    });

    test(`${lang} products index links no empty-state stylesheet`, () => {
      const html = readFileSync(
        join(DIST, lang, "products", "index.html"),
        "utf8",
      );
      const sheets = linkedStylesheets(html);
      expect(sheets.filter((s) => /ProofFirstEmptyState/.test(s))).toEqual([]);
      // The cards are rendered here, so their stylesheet is expected.
      expect(sheets.some((s) => /ProductCard/.test(s))).toBe(true);
    });
  }

  test("moved selectors are absent from the global bundle", () => {
    const html = readFileSync(join(DIST, "en", "index.html"), "utf8");
    const base = linkedStylesheets(html).filter((s) => /BaseLayout/.test(s));
    expect(base.length).toBeGreaterThan(0);
    for (const href of base) {
      expect(auditGlobalBundle(readDistCss(href))).toEqual([]);
    }
  });

  test("negative proof: the audits flag a reintroduced stylesheet", () => {
    const html =
      '<link rel="stylesheet" href="/_astro/ProofFirstEmptyState.x.css">' +
      '<link rel="stylesheet" href="/_astro/ProductCard.y.css">';
    const fake: CssReader = () => ".product-card[data-astro-cid-a]{flex:auto}";
    expect(auditHomeStylesheets(html, fake).length).toBeGreaterThanOrEqual(2);
    expect(
      auditGlobalBundle(".experience-spine{top:0}.c4-folio{gap:1px}"),
    ).toEqual([
      ".experience-spine in global bundle",
      ".c4-folio in global bundle",
    ]);
  });
});
