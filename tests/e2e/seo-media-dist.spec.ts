import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import {
  LOCALES,
  parseShowcase,
  screenshotProblems,
  sitemapImageProblems,
  softwareApplication,
  type RecordScreen,
} from "../lib/seo-media-dist";

/**
 * SEO media guard (Wave H, SEO-1). Reads the built `dist/` (run `pnpm build`
 * first; with `PUBLIC_SITE_URL=https://blueskyzlabs.com` for a populated
 * sitemap) and checks, against the showcase records in src/content/showcases:
 *  (a) a product page with a showcase carries SoftwareApplication.screenshot
 *      entries equal to the record's screens, each url a file in dist;
 *  (b) every sitemap image:loc is a file in dist, sits under a product page
 *      entry and belongs to that product's record;
 *  (c) a product without a showcase gains no screenshot.
 * It FAILS (never skips) when dist/ is absent. A non-production build emits an
 * empty sitemap, so (b) is only exercised against a production-URL build.
 * Raw-file scan: engine-independent, so it runs on chromium only.
 */
const DIST = process.env.SEO_MEDIA_DIST ?? join(process.cwd(), "dist");
const SHOWCASES = "src/content/showcases";
const PRODUCTS = "src/content/products";

const fileExists = (distPath: string) => {
  const p = join(DIST, distPath);
  return existsSync(p) && statSync(p).isFile();
};

function load() {
  if (!existsSync(join(DIST, "sitemap.xml"))) {
    throw new Error(`dist/ is absent or incomplete at ${DIST}: run pnpm build`);
  }
  const showcases = new Map<string, RecordScreen[]>();
  for (const file of readdirSync(SHOWCASES).filter((f) =>
    f.endsWith(".yaml"),
  )) {
    const { product, screens } = parseShowcase(
      readFileSync(join(SHOWCASES, file), "utf8"),
    );
    showcases.set(product, screens);
  }
  const publicSlugs = readdirSync(PRODUCTS)
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => readFileSync(join(PRODUCTS, f), "utf8"))
    .filter((y) => /^public: true$/m.test(y))
    .map((y) => /^slug:\s*"?([a-z0-9-]+)"?/m.exec(y)?.[1] as string);
  const identity = new Map<string, string | undefined>(
    readdirSync(PRODUCTS)
      .filter((f) => f.endsWith(".yaml"))
      .map((f) => readFileSync(join(PRODUCTS, f), "utf8"))
      .map((y) => [
        /^slug:\s*"?([a-z0-9-]+)"?/m.exec(y)?.[1] as string,
        /^ {4}src:\s*"?(\/products\/[^"\n]+)"?/m.exec(y)?.[1],
      ]),
  );
  const allowed = new Map<string, Set<string>>(
    publicSlugs.map((slug) => [
      slug,
      new Set([
        ...(identity.get(slug) ? [identity.get(slug) as string] : []),
        ...(showcases.get(slug) ?? []).map((s) => s.src),
      ]),
    ]),
  );
  return { showcases, publicSlugs, allowed };
}

test.describe("SEO media in dist", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "raw-file scan: engine-independent, runs on chromium only",
    );
  });

  test("the record set is non-empty (the guard cannot pass on nothing)", () => {
    const { showcases, publicSlugs } = load();
    expect(showcases.size).toBeGreaterThan(0);
    expect(publicSlugs.length).toBeGreaterThan(0);
    for (const screens of showcases.values()) {
      expect(screens.length).toBeGreaterThan(0);
    }
  });

  test("product pages: screenshot entries equal the showcase record (a, c)", () => {
    const { showcases, publicSlugs } = load();
    const problems: string[] = [];
    for (const lang of LOCALES) {
      for (const slug of publicSlugs) {
        const html = readFileSync(
          join(DIST, lang, "products", slug, "index.html"),
          "utf8",
        );
        problems.push(
          ...screenshotProblems(
            softwareApplication(html),
            showcases.get(slug) ?? null,
            lang,
            fileExists,
            `${lang}/${slug}`,
          ),
        );
      }
    }
    expect(problems).toEqual([]);
  });

  test("sitemap: image:loc files exist and sit only under product entries (b)", () => {
    const { allowed } = load();
    const xml = readFileSync(join(DIST, "sitemap.xml"), "utf8");
    expect(sitemapImageProblems(xml, allowed, fileExists)).toEqual([]);
  });

  test("negative proof: the predicates reject broken fixtures", () => {
    const record: RecordScreen[] = [
      {
        src: "/products/x/showcase/a.webp",
        width: 10,
        height: 20,
        alt: { en: "A" },
      },
    ];
    const origin = "https://blueskyzlabs.com";
    const good = {
      "@type": "SoftwareApplication",
      url: `${origin}/en/products/x/`,
      screenshot: [
        {
          "@type": "ImageObject",
          url: `${origin}/products/x/showcase/a.webp`,
          width: 10,
          height: 20,
          caption: "A",
        },
      ],
    };
    const exists = (p: string) => p === "/products/x/showcase/a.webp";
    const run = (node: object | null, screens: RecordScreen[] | null) =>
      screenshotProblems(node, screens, "en", exists, "fx");
    expect(run(good, record)).toEqual([]);
    // url not in the record
    const foreign = structuredClone(good);
    foreign.screenshot[0]!.url = `${origin}/products/x/showcase/other.webp`;
    expect(run(foreign, record).length).toBeGreaterThan(0);
    // url in the record but missing from dist
    expect(
      screenshotProblems(good, record, "en", () => false, "fx").length,
    ).toBeGreaterThan(0);
    // caption, size and count drift
    const drift = structuredClone(good);
    drift.screenshot[0]!.caption = "invented";
    drift.screenshot[0]!.width = 11;
    expect(run(drift, record).length).toBeGreaterThanOrEqual(2);
    expect(run({ ...good, screenshot: [] }, record).length).toBeGreaterThan(0);
    // product without a showcase gains a screenshot
    expect(run(good, null).length).toBeGreaterThan(0);
    expect(run({ ...good, screenshot: undefined }, null)).toEqual([]);

    const ns = 'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
    const allowed = new Map([["x", new Set(["/products/x/showcase/a.webp"])]]);
    const entry = (loc: string, img: string) =>
      `<urlset ${ns}><url><loc>${loc}</loc><image:image><image:loc>${img}</image:loc></image:image></url></urlset>`;
    const page = `${origin}/en/products/x/`;
    const ok = entry(page, `${origin}/products/x/showcase/a.webp`);
    expect(sitemapImageProblems(ok, allowed, exists)).toEqual([]);
    // image:loc to a missing file
    expect(
      sitemapImageProblems(
        entry(page, `${origin}/products/x/showcase/gone.webp`),
        allowed,
        exists,
      ).length,
    ).toBeGreaterThan(0);
    // image:loc under a non-product entry
    expect(
      sitemapImageProblems(
        entry(`${origin}/en/about/`, `${origin}/products/x/showcase/a.webp`),
        allowed,
        exists,
      ).length,
    ).toBeGreaterThan(0);
    // image of another product's record, relative url, missing namespace
    expect(
      sitemapImageProblems(
        entry(page, "/products/x/showcase/a.webp"),
        allowed,
        exists,
      ).length,
    ).toBeGreaterThan(0);
    expect(
      sitemapImageProblems(ok.replace(ns, ""), allowed, exists).length,
    ).toBeGreaterThan(0);
  });
});
