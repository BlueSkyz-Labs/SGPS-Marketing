/**
 * Pure predicates for the built-site SEO media guard (tests/e2e/seo-media-dist
 * .spec.ts). Each returns human-readable problems; an empty list is the pass
 * state. They read raw `dist/` HTML/XML and the showcase YAML records, so the
 * expected screenshots come from the record, never from the page under test.
 */

export const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;
export type Locale = (typeof LOCALES)[number];

export type RecordScreen = {
  src: string;
  width: number;
  height: number;
  alt: Record<string, string>;
};

const unquote = (value: string): string => {
  const v = value.trim();
  const quoted = /^"(.*)"$/.exec(v) ?? /^'(.*)'$/.exec(v);
  return quoted ? (quoted[1] ?? "") : v;
};

/** The `product:` slug and `screens:` entries of one showcase YAML record. */
export function parseShowcase(yaml: string): {
  product: string;
  screens: RecordScreen[];
} {
  const product = unquote(/^product:\s*(.+)$/m.exec(yaml)?.[1] ?? "");
  const section = /^screens:\n([\s\S]*?)(?=^\S|(?![\s\S]))/m.exec(yaml)?.[1];
  const screens: RecordScreen[] = [];
  for (const block of (section ?? "").split(/^ {2}- id:/m).slice(1)) {
    const field = (name: string) =>
      new RegExp(`^ {4}${name}:\\s*(.+)$`, "m").exec(block)?.[1];
    const altBlock = /^ {4}alt:\n((?: {6}.+\n?)+)/m.exec(block)?.[1] ?? "";
    const alt: Record<string, string> = {};
    for (const m of altBlock.matchAll(/^ {6}([a-z-]+):\s*(.+)$/gm)) {
      alt[m[1] as string] = unquote(m[2] as string);
    }
    screens.push({
      src: unquote(field("src") ?? ""),
      width: Number(field("width")),
      height: Number(field("height")),
      alt,
    });
  }
  return { product, screens };
}

type JsonNode = Record<string, unknown>;

/** The SoftwareApplication JSON-LD node of a built page, or null. */
export function softwareApplication(html: string): JsonNode | null {
  for (const m of html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  )) {
    try {
      const parsed: unknown = JSON.parse(m[1] as string);
      const nodes = (Array.isArray(parsed) ? parsed : [parsed]).flatMap(
        (n: JsonNode) => (n["@graph"] as JsonNode[] | undefined) ?? [n],
      );
      const hit = nodes.find((n) => n["@type"] === "SoftwareApplication");
      if (hit) return hit;
    } catch {
      /* malformed JSON-LD is reported by the structured-data guards */
    }
  }
  return null;
}

/** Path of a same-site absolute URL, or null when it is not an https/http URL. */
function pathOf(url: string): { origin: string; path: string } | null {
  try {
    const u = new URL(url);
    return { origin: u.origin, path: u.pathname };
  } catch {
    return null;
  }
}

/**
 * (a) With a showcase record the node must carry exactly the record's screens
 * (url, size, localized alt) and every url must be a file in dist; without a
 * record (`screens` null) the node must carry no `screenshot` at all (c).
 */
export function screenshotProblems(
  node: JsonNode | null,
  screens: readonly RecordScreen[] | null,
  lang: Locale,
  fileExists: (distPath: string) => boolean,
  label: string,
): string[] {
  if (!node) return [`${label}: no SoftwareApplication JSON-LD`];
  const shots = node.screenshot as JsonNode[] | undefined;
  if (!screens) {
    return shots === undefined
      ? []
      : [`${label}: product without a showcase carries screenshot`];
  }
  if (!Array.isArray(shots) || shots.length !== screens.length) {
    return [
      `${label}: expected ${screens.length} screenshot entries, found ${
        Array.isArray(shots) ? shots.length : "none"
      }`,
    ];
  }
  const out: string[] = [];
  const origin = pathOf(String(node.url ?? ""))?.origin;
  screens.forEach((screen, i) => {
    const shot = shots[i] as JsonNode;
    const parsed = pathOf(String(shot.url ?? ""));
    if (shot["@type"] !== "ImageObject")
      out.push(`${label}[${i}]: not ImageObject`);
    if (!parsed || parsed.path !== screen.src || parsed.origin !== origin) {
      out.push(`${label}[${i}]: url ${shot.url} is not ${origin}${screen.src}`);
    } else if (!fileExists(parsed.path)) {
      out.push(`${label}[${i}]: ${parsed.path} is not a file in dist`);
    }
    if (shot.width !== screen.width || shot.height !== screen.height) {
      out.push(
        `${label}[${i}]: size ${shot.width}x${shot.height} differs from record`,
      );
    }
    const alt = screen.alt[lang] ?? screen.alt.en;
    if (!alt || shot.caption !== alt) {
      out.push(`${label}[${i}]: caption differs from the record's ${lang} alt`);
    }
  });
  return out;
}

/** Sitemap `<url>` blocks: page loc and its image:loc values. */
export function sitemapEntries(
  xml: string,
): { loc: string; images: string[] }[] {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    loc: /<loc>([^<]*)<\/loc>/.exec(m[1] as string)?.[1] ?? "",
    images: [
      ...(m[1] as string).matchAll(/<image:loc>([^<]*)<\/image:loc>/g),
    ].map((i) => (i[1] as string).replace(/&amp;/g, "&")),
  }));
}

/**
 * (b) The image namespace is declared; image:loc appears only under product
 * page entries; each one is an absolute production URL of a file in dist and
 * belongs to that product's record (identity art or a showcase screen).
 */
export function sitemapImageProblems(
  xml: string,
  allowedByProduct: ReadonlyMap<string, ReadonlySet<string>>,
  fileExists: (distPath: string) => boolean,
): string[] {
  const out: string[] = [];
  if (
    !xml.includes(
      'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
    )
  ) {
    out.push("sitemap: image namespace not declared");
  }
  for (const entry of sitemapEntries(xml)) {
    if (entry.images.length === 0) continue;
    const page = pathOf(entry.loc);
    const slug = new RegExp(
      `^/(?:${LOCALES.join("|")})/products/([a-z0-9-]+)/$`,
    ).exec(page?.path ?? "")?.[1];
    if (!slug || !allowedByProduct.has(slug)) {
      out.push(`sitemap: image:loc under non-product entry ${entry.loc}`);
      continue;
    }
    for (const image of entry.images) {
      const img = pathOf(image);
      if (!img || img.origin !== page?.origin) {
        out.push(`sitemap: ${image} is not an absolute URL on ${page?.origin}`);
      } else if (!fileExists(img.path)) {
        out.push(
          `sitemap: ${img.path} (under ${entry.loc}) is not a file in dist`,
        );
      } else if (!allowedByProduct.get(slug)?.has(img.path)) {
        out.push(`sitemap: ${img.path} is not in the ${slug} record`);
      }
    }
  }
  return out;
}
