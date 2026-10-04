/**
 * Pure helpers for the post-deploy smoke: same-origin asset extraction,
 * content-type consistency, and `public/_headers` expectation parsing.
 * No I/O and no top-level side effects, so architecture tests can import them.
 */

const NAMED_ENTITIES = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" };

function decodeAttribute(value) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, body) => {
    if (body[0] === "#") {
      const code =
        body[1].toLowerCase() === "x"
          ? Number.parseInt(body.slice(2), 16)
          : Number.parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
  });
}

function attributesOf(tag) {
  const attributes = new Map();
  const pattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  for (const match of tag.matchAll(pattern)) {
    const name = match[1].toLowerCase();
    if (!attributes.has(name)) {
      attributes.set(name, decodeAttribute(match[2] ?? match[3] ?? ""));
    }
  }
  return attributes;
}

/** `<link rel>` values that fetch a resource (not navigation/metadata). */
const ASSET_LINK_RELS = new Set([
  "stylesheet",
  "icon",
  "shortcut",
  "apple-touch-icon",
  "mask-icon",
  "preload",
  "modulepreload",
  "manifest",
]);

const SOCIAL_IMAGE_META = new Set([
  "og:image",
  "og:image:url",
  "og:image:secure_url",
  "og:video",
  "twitter:image",
]);

function splitSrcset(value) {
  return value
    .split(",")
    .map((candidate) => candidate.trim().split(/\s+/)[0])
    .filter(Boolean);
}

/**
 * Extract same-origin asset URLs (absolute same-origin or root-relative) from
 * `src`, `poster`, `srcset`, asset-type `<link href>` and social image meta.
 * Origin matching is exact (scheme + host + port). Fragments are dropped.
 * Returns a sorted, de-duplicated list of `path?query` strings.
 */
export function extractSameOriginAssetPaths(html, pageUrl, site) {
  const origin = new URL(site).origin;
  const found = new Set();

  const add = (candidate) => {
    const value = candidate?.trim();
    if (!value || value.startsWith("#") || value.startsWith("//")) return;
    if (/^(data|blob|mailto|tel|javascript):/i.test(value)) return;
    let url;
    try {
      url = new URL(value, pageUrl);
    } catch {
      return;
    }
    if (url.origin !== origin) return;
    found.add(`${url.pathname}${url.search}`);
  };

  for (const [tag] of html.matchAll(/<[a-zA-Z][^>]*>/g)) {
    const name = tag.match(/^<([a-zA-Z0-9-]+)/)?.[1].toLowerCase();
    const attributes = attributesOf(tag);
    add(attributes.get("src"));
    add(attributes.get("poster"));
    for (const candidate of splitSrcset(attributes.get("srcset") ?? "")) {
      add(candidate);
    }
    if (name === "link") {
      const rels = (attributes.get("rel") ?? "").toLowerCase().split(/\s+/);
      if (rels.some((rel) => ASSET_LINK_RELS.has(rel))) {
        add(attributes.get("href"));
      }
    }
    if (name === "meta") {
      const key = (
        attributes.get("property") ??
        attributes.get("name") ??
        ""
      ).toLowerCase();
      if (SOCIAL_IMAGE_META.has(key)) add(attributes.get("content"));
    }
  }
  return [...found].sort();
}

/** Extension → acceptable content-type patterns. Unknown extensions: no rule. */
const CONTENT_TYPE_RULES = new Map([
  ...["png", "jpg", "jpeg", "webp", "avif", "gif", "svg", "ico"].map((ext) => [
    ext,
    [/^image\//],
  ]),
  ...["mp4", "webm", "mov", "m4v", "ogv"].map((ext) => [ext, [/^video\//]]),
  ["vtt", [/^text\/vtt$/]],
  ["css", [/^text\/css$/]],
  ["js", [/^(application|text)\/(x-)?javascript$/]],
  ["mjs", [/^(application|text)\/(x-)?javascript$/]],
  ...["woff", "woff2", "ttf", "otf"].map((ext) => [
    ext,
    [/^font\//, /^application\/(x-)?font-/],
  ]),
  ["webmanifest", [/^application\/(manifest\+)?json$/]],
]);

export function extensionOf(pathname) {
  const last = pathname.split("/").pop() ?? "";
  const dot = last.lastIndexOf(".");
  return dot === -1 ? "" : last.slice(dot + 1).toLowerCase();
}

/** True when the content-type is consistent with the path extension. */
export function contentTypeMatches(pathname, contentType) {
  const rules = CONTENT_TYPE_RULES.get(extensionOf(pathname));
  if (!rules) return true;
  const mime = (contentType ?? "").split(";")[0].trim().toLowerCase();
  return rules.some((rule) => rule.test(mime));
}

/**
 * Judge one asset response (fetched with redirect: "manual").
 * Returns a human-readable problem, or null when the asset is healthy.
 */
export function assetProblem({ pathname, status, contentType, location }) {
  if (status !== 200) {
    const target = location ? ` -> ${location}` : "";
    return `status ${status}${target} (expected 200 without redirect)`;
  }
  if (!contentTypeMatches(pathname, contentType)) {
    return `content-type ${contentType || "missing"} does not fit .${extensionOf(pathname)}`;
  }
  return null;
}

/** Parse a Cloudflare `_headers` file into Map<routePattern, Map<lowercaseName, value>>. */
export function parseHeadersFile(text) {
  const routes = new Map();
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      current = new Map();
      routes.set(line.trim(), current);
      continue;
    }
    const separator = line.indexOf(":");
    if (current && separator !== -1) {
      current.set(
        line.slice(0, separator).trim().toLowerCase(),
        line.slice(separator + 1).trim(),
      );
    }
  }
  return routes;
}

export const REQUIRED_CSP_DIRECTIVES = [
  "media-src 'self'",
  "upgrade-insecure-requests",
  "frame-ancestors 'none'",
  "script-src 'self' 'inline-speculation-rules'",
];

const REQUIRED_HTML_HEADERS = [
  "cross-origin-opener-policy",
  "cross-origin-resource-policy",
  "x-content-type-options",
  "x-frame-options",
  "strict-transport-security",
  "referrer-policy",
  "permissions-policy",
];

export function cspDirectives(value) {
  return (value ?? "")
    .split(";")
    .map((directive) => directive.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

/**
 * Derive smoke expectations from the `_headers` source. Fails closed (throws)
 * when the file no longer declares what the smoke must assert, so the smoke
 * cannot silently pass against an emptied expectation.
 */
export function buildHeaderExpectations(headersText) {
  const routes = parseHeadersFile(headersText);
  const all = routes.get("/*");
  const astro = routes.get("/_astro/*");
  if (!all) throw new Error("_headers has no /* block");
  if (!astro) throw new Error("_headers has no /_astro/* block");

  const csp = cspDirectives(all.get("content-security-policy"));
  const missingCsp = REQUIRED_CSP_DIRECTIVES.filter((d) => !csp.includes(d));
  if (missingCsp.length > 0) {
    throw new Error(`_headers CSP lacks: ${missingCsp.join(", ")}`);
  }
  const exact = {};
  for (const name of REQUIRED_HTML_HEADERS) {
    const value = all.get(name);
    if (!value) throw new Error(`_headers /* block lacks ${name}`);
    exact[name] = value;
  }
  const cache = astro.get("cache-control") ?? "";
  for (const token of ["immutable", "max-age=31536000"]) {
    if (!cache.includes(token)) {
      throw new Error(`_headers /_astro/* Cache-Control lacks ${token}`);
    }
  }
  return {
    cspDirectives: [...REQUIRED_CSP_DIRECTIVES],
    exactHeaders: exact,
    cacheControlTokens: ["immutable", "max-age=31536000"],
  };
}

/** `getHeader(name)` returns the response header value or null. */
export function htmlHeaderProblems(getHeader, expectations) {
  const problems = [];
  const directives = cspDirectives(getHeader("content-security-policy"));
  for (const directive of expectations.cspDirectives) {
    if (!directives.includes(directive)) {
      problems.push(`CSP missing directive "${directive}"`);
    }
  }
  for (const [name, expected] of Object.entries(expectations.exactHeaders)) {
    const actual = getHeader(name);
    if (actual === null || actual === undefined) {
      problems.push(`${name} missing (expected "${expected}")`);
    } else if (actual.trim().toLowerCase() !== expected.toLowerCase()) {
      problems.push(`${name} is "${actual}" (expected "${expected}")`);
    }
  }
  return problems;
}

export function immutableAssetHeaderProblems(getHeader, expectations) {
  const cache = getHeader("cache-control") ?? "";
  return expectations.cacheControlTokens
    .filter((token) => !cache.includes(token))
    .map((token) => `Cache-Control "${cache}" lacks ${token}`);
}

/** Extract product-detail hrefs (`/<locale>/products/<slug>/`) from an index page. */
export function extractProductPaths(html, locale) {
  const prefix = `/${locale}/products/`;
  const paths = new Set();
  for (const match of html.matchAll(/href="([^"#?]+)"/g)) {
    const href = match[1];
    if (
      href.startsWith(prefix) &&
      href.endsWith("/") &&
      href.slice(prefix.length, -1).length > 0 &&
      !href.slice(prefix.length, -1).includes("/")
    ) {
      paths.add(href);
    }
  }
  return [...paths].sort();
}
