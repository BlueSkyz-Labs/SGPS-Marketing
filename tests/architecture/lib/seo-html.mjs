/**
 * v12 S2: pure predicates over built HTML and the product registry, shared by
 * the source/dist architecture guard (seo-v12-structured-data.test.mjs) and
 * the CI-side route scan (tests/e2e/seo-v12-routes.spec.ts). Every predicate
 * returns a list of human-readable problems; an empty list is the pass state.
 */

const decode = (text) =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

/** Head and outline facts of one built page. */
export function pageFacts(html) {
  const pick = (re) => {
    const m = html.match(re);
    return m ? decode(m[1]) : "";
  };
  const jsonLd = [
    ...html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map((m) => {
    try {
      return { ok: true, data: JSON.parse(m[1]) };
    } catch (error) {
      return { ok: false, error: String(error) };
    }
  });
  return {
    title: pick(/<title>([^<]*)<\/title>/),
    description: pick(/<meta name="description" content="([^"]*)"/),
    canonical: pick(/<link rel="canonical" href="([^"]*)"/),
    canonicalCount: (html.match(/<link rel="canonical"/g) ?? []).length,
    h1Count: (html.match(/<h1[\s>]/g) ?? []).length,
    isRedirectStub: /<meta http-equiv="refresh"/i.test(html),
    jsonLd,
  };
}

/** Keys that would claim ratings, reviews or prices the registry never holds. */
export const FORBIDDEN_JSONLD_KEYS = Object.freeze([
  "aggregateRating",
  "review",
  "reviews",
  "ratingValue",
  "offers",
  "price",
  "priceCurrency",
  "priceSpecification",
  "sameAs",
  "contactPoint",
]);

/** Paths (a.b[0].c) of every forbidden key anywhere in a JSON-LD node. */
export function forbiddenKeyPaths(node, path = "$") {
  if (Array.isArray(node)) {
    return node.flatMap((item, i) => forbiddenKeyPaths(item, `${path}[${i}]`));
  }
  if (!node || typeof node !== "object") return [];
  return Object.entries(node).flatMap(([key, value]) => [
    ...(FORBIDDEN_JSONLD_KEYS.includes(key) ? [`${path}.${key}`] : []),
    ...forbiddenKeyPaths(value, `${path}.${key}`),
  ]);
}

const isAbsoluteHttp = (value) =>
  typeof value === "string" && /^https?:\/\/[^\s]+$/.test(value);
const isText = (value) => typeof value === "string" && value.trim() !== "";

/** Required properties per schema.org type the site emits (and nothing else). */
const SHAPES = {
  Organization: (n) => [
    ...(isText(n.name) ? [] : ["name"]),
    ...(isAbsoluteHttp(n.url) ? [] : ["url"]),
    ...(n.logo === undefined || isAbsoluteHttp(n.logo) ? [] : ["logo"]),
  ],
  WebSite: (n) => [
    ...(isText(n.name) ? [] : ["name"]),
    ...(isAbsoluteHttp(n.url) ? [] : ["url"]),
    ...(n.publisher?.["@type"] === "Organization" ? [] : ["publisher"]),
  ],
  SoftwareApplication: (n) => [
    ...(isText(n.name) ? [] : ["name"]),
    ...(isText(n.description) ? [] : ["description"]),
    ...(isAbsoluteHttp(n.url) ? [] : ["url"]),
    ...(n.publisher?.["@type"] === "Organization" ? [] : ["publisher"]),
  ],
  BreadcrumbList: (n) => {
    const items = Array.isArray(n.itemListElement) ? n.itemListElement : [];
    if (items.length < 2) return ["itemListElement (needs 2+)"];
    return items.flatMap((item, i) => [
      ...(item?.["@type"] === "ListItem" ? [] : [`item ${i} @type`]),
      ...(item?.position === i + 1 ? [] : [`item ${i} position`]),
      ...(isText(item?.name) ? [] : [`item ${i} name`]),
      ...(isAbsoluteHttp(item?.item) ? [] : [`item ${i} item url`]),
    ]);
  },
};

export const EMITTED_JSONLD_TYPES = Object.freeze(Object.keys(SHAPES));

/** Problems with one top-level JSON-LD block (shape, context, forbidden keys). */
export function jsonLdProblems(node) {
  if (!node || typeof node !== "object" || Array.isArray(node)) {
    return ["block is not a single JSON object"];
  }
  const type = node["@type"];
  const problems = [];
  if (node["@context"] !== "https://schema.org") problems.push("@context");
  const shape = SHAPES[type];
  if (!shape) problems.push(`unexpected @type ${JSON.stringify(type)}`);
  else problems.push(...shape(node).map((field) => `${type}.${field}`));
  problems.push(
    ...forbiddenKeyPaths(node).map((path) => `forbidden key ${path}`),
  );
  return problems;
}

// --- registry -------------------------------------------------------------

const unquote = (value) => {
  const v = value.trim();
  return /^".*"$/.test(v) ? JSON.parse(v) : v;
};

/**
 * The registry fields the SoftwareApplication node may carry, read from the
 * product YAML with anchored patterns (the record layout is schema-checked by
 * `src/lib/product-schema.ts`).
 */
export function registryFacts(yaml) {
  const top = (key) => {
    const m = yaml.match(new RegExp(`^${key}: (.+)$`, "m"));
    return m ? unquote(m[1]) : undefined;
  };
  const platforms =
    yaml
      .match(/^platforms:\n((?: {2}- .+\n)+)/m)?.[1]
      .match(/- (\S+)/g)
      ?.map((item) => item.slice(2)) ?? [];
  const localized = { en: top("shortDescription") };
  for (const lang of ["vi", "zh", "zh-hant"]) {
    const block = yaml.match(
      new RegExp(`^ {2}${lang}:\\n((?: {4}.+\\n)+)`, "m"),
    )?.[1];
    const line = block?.match(/^ {4}shortDescription: (.+)$/m)?.[1];
    if (line) localized[lang] = unquote(line);
  }
  return {
    slug: top("slug"),
    name: top("name"),
    applicationCategory: top("applicationCategory"),
    platforms,
    shortDescription: localized,
  };
}

/** Mirrors the platform labels of `productJsonLd` in src/lib/seo.ts. */
const OS_LABELS = {
  web: "Web",
  android: "Android",
  ios: "iOS",
  macos: "macOS",
  windows: "Windows",
};

export function expectedOperatingSystem(platforms) {
  const labels = [
    ...new Set(platforms.flatMap((p) => (OS_LABELS[p] ? [OS_LABELS[p]] : []))),
  ];
  return labels.length ? labels.join(", ") : undefined;
}

/** Fields a SoftwareApplication may carry; anything else is not registry-derived. */
const APP_KEYS = new Set([
  "@context",
  "@type",
  "name",
  "description",
  "url",
  "inLanguage",
  "applicationCategory",
  "operatingSystem",
  "publisher",
  "image",
]);

/** Problems where a SoftwareApplication node departs from its registry record. */
export function appRegistryProblems(app, facts, lang) {
  const problems = [];
  const expectedDescription =
    facts.shortDescription[lang] ?? facts.shortDescription.en;
  if (app.name !== facts.name) problems.push(`name ${app.name}`);
  if (app.description !== expectedDescription) {
    problems.push(`description ${app.description}`);
  }
  if (!String(app.url ?? "").endsWith(`/${lang}/products/${facts.slug}/`)) {
    problems.push(`url ${app.url}`);
  }
  // Category is record-owned: present exactly when the record declares it.
  if (app.applicationCategory !== facts.applicationCategory) {
    problems.push(`applicationCategory ${app.applicationCategory}`);
  }
  if (app.operatingSystem !== expectedOperatingSystem(facts.platforms)) {
    problems.push(`operatingSystem ${app.operatingSystem}`);
  }
  for (const key of Object.keys(app)) {
    if (!APP_KEYS.has(key)) problems.push(`non-registry key ${key}`);
  }
  return problems;
}

// --- titles and descriptions -----------------------------------------------

/** Values that occur on more than one route, as { value: [routes] }. */
export function duplicates(rows, field) {
  const seen = new Map();
  for (const row of rows) {
    const key = row[field];
    seen.set(key, [...(seen.get(key) ?? []), row.route]);
  }
  return Object.fromEntries(
    [...seen].filter(([, routes]) => routes.length > 1),
  );
}

export const localeOfRoute = (route) =>
  route.match(/^\/(en|vi|zh-hant|zh)\//)?.[1] ?? "root";

// --- built pages -------------------------------------------------------------

/** 404 pages exist twice (404.html and 404/); redirect stubs carry no page. */
export const isRealPage = (page) =>
  !page.isRedirectStub && !/\/404(\.html|\/)$/.test(page.route);

/**
 * All problems of a set of built pages; [] is the pass state. `records` are
 * the public registry records as `{ facts }` (see `registryFacts`).
 */
export function builtPageProblems(pages, records) {
  const problems = [];
  const real = pages.filter(isRealPage);
  for (const page of real) {
    if (page.h1Count !== 1) problems.push(`${page.route}: ${page.h1Count} h1`);
    if (!page.title) problems.push(`${page.route}: no title`);
    if (!page.description) problems.push(`${page.route}: no description`);
    if (page.canonicalCount !== 1) problems.push(`${page.route}: canonical`);
    const types = [];
    for (const block of page.jsonLd) {
      if (!block.ok) {
        problems.push(`${page.route}: JSON-LD does not parse`);
        continue;
      }
      types.push(block.data["@type"]);
      for (const p of jsonLdProblems(block.data)) {
        problems.push(`${page.route}: ${p}`);
      }
      if (block.data["@type"] === "SoftwareApplication") {
        const lang = localeOfRoute(page.route);
        const slug = page.route.match(/\/products\/([a-z0-9-]+)\/$/)?.[1];
        const record = records.find((r) => r.facts.slug === slug);
        if (!record) problems.push(`${page.route}: app without a record`);
        else {
          for (const p of appRegistryProblems(block.data, record.facts, lang)) {
            problems.push(`${page.route}: ${p}`);
          }
        }
      }
    }
    for (const required of ["Organization", "WebSite"]) {
      if (!types.includes(required)) {
        problems.push(`${page.route}: missing ${required}`);
      }
    }
    if (/^\/(en|vi|zh|zh-hant)\/products\/[a-z0-9-]+\/$/.test(page.route)) {
      for (const required of ["SoftwareApplication", "BreadcrumbList"]) {
        if (!types.includes(required)) {
          problems.push(`${page.route}: missing ${required}`);
        }
      }
    }
  }
  for (const lang of ["en", "vi", "zh", "zh-hant", "root"]) {
    const rows = real.filter((page) => localeOfRoute(page.route) === lang);
    for (const field of ["title", "description"]) {
      for (const [value, routes] of Object.entries(duplicates(rows, field))) {
        problems.push(`${lang} duplicate ${field} "${value}": ${routes}`);
      }
    }
  }
  return problems;
}
