import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const { resolveLocale } = await import("../../src/lib/locale-resolve.ts");
const workerModule = await import("../../src/worker/index.ts");
const { SECURITY_HEADERS } =
  await import("../../src/worker/security-headers.ts");
const worker = workerModule.default;

const read = (p) => readFileSync(p, "utf8");
const wrangler = read("wrangler.toml");
const workerSource = read("src/worker/index.ts");
const headersFile = read("public/_headers");

// ---- guards (pure functions of the inputs so negative proofs can mutate) ----

function runWorkerFirst(toml) {
  const match = /run_worker_first\s*=\s*\[([^\]]*)\]/.exec(toml);
  if (!match) return null;
  return [...match[1].matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
}

function runWorkerFirstFindings(toml) {
  const rules = runWorkerFirst(toml);
  if (!rules) return ["run_worker_first must be an explicit array"];
  const allowed = new Set(["/", "/index.html"]);
  const findings = rules
    .filter((rule) => !allowed.has(rule))
    .map((rule) => `run_worker_first must not include ${rule}`);
  for (const path of ["/", "/index.html"]) {
    if (!rules.includes(path))
      findings.push(`run_worker_first must include ${path}`);
  }
  return findings;
}

function redirectHeaderFindings(response) {
  const findings = [];
  if (response.status !== 302) findings.push("status must be 302");
  if (response.headers.get("cache-control") !== "private, no-store")
    findings.push("Cache-Control must be private, no-store");
  const vary = (response.headers.get("vary") ?? "").toLowerCase();
  for (const v of ["cookie", "accept-language"])
    if (!vary.includes(v)) findings.push(`Vary must include ${v}`);
  if (response.headers.get("set-cookie"))
    findings.push("Worker must not set cookies");
  for (const [name, value] of SECURITY_HEADERS)
    if (response.headers.get(name) !== value) findings.push(`missing ${name}`);
  return findings;
}

function parseHeadersBlock(text, pattern) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.trim() === pattern);
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (!/^\s+\S/.test(lines[i])) break;
    const [name, ...rest] = lines[i].trim().split(":");
    out.push([name.trim(), rest.join(":").trim()]);
  }
  return out;
}

function securityParityFindings(headersText, mirror) {
  const source = parseHeadersBlock(headersText, "/*");
  const findings = [];
  for (const [name, value] of source) {
    const copy = mirror.find(([n]) => n === name);
    if (!copy) findings.push(`worker mirror missing ${name}`);
    else if (copy[1] !== value)
      findings.push(`worker mirror drifted for ${name}`);
  }
  if (source.length === 0) findings.push("no /* block found in _headers");
  return findings;
}

const ASSET_SENTINEL = new Response("asset", { status: 200 });
const env = {
  ASSETS: {
    calls: [],
    async fetch(request) {
      this.calls.push(new URL(request.url).pathname);
      return ASSET_SENTINEL;
    },
  },
};
const call = (path, init = {}) =>
  worker.fetch(new Request(`https://example.test${path}`, init), env);

// ---- tests ----

test("wrangler binds ASSETS and runs the Worker first ONLY for root paths", () => {
  assert.match(wrangler, /^main\s*=\s*["']src\/worker\/index\.ts["']/m);
  assert.match(wrangler, /binding\s*=\s*["']ASSETS["']/);
  assert.deepEqual(runWorkerFirst(wrangler), ["/", "/index.html"]);
  assert.deepEqual(runWorkerFirstFindings(wrangler), []);
  assert.doesNotMatch(wrangler, /run_worker_first\s*=\s*true/);
});

test("negative proof: broadening run_worker_first is caught", () => {
  for (const bad of [
    wrangler.replace(
      /run_worker_first\s*=\s*\[[^\]]*\]/,
      "run_worker_first = true",
    ),
    wrangler.replace(
      /run_worker_first\s*=\s*\[[^\]]*\]/,
      'run_worker_first = ["/*"]',
    ),
    wrangler.replace(
      /run_worker_first\s*=\s*\[[^\]]*\]/,
      'run_worker_first = ["/", "/index.html", "/en/*"]',
    ),
    wrangler.replace(
      /run_worker_first\s*=\s*\[[^\]]*\]/,
      'run_worker_first = ["/"]',
    ),
    wrangler.replace(/^run_worker_first[^\n]*\n/m, ""),
  ]) {
    assert.ok(runWorkerFirstFindings(bad).length > 0);
  }
});

test("root GET redirects to the resolved locale, preserving the query string", async () => {
  const res = await call("/?utm_source=x&a=1", {
    headers: { "CF-IPCountry": "VN" },
  });
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("location"), "/vi/?utm_source=x&a=1");
  assert.deepEqual(redirectHeaderFindings(res), []);
  const index = await call("/index.html", {
    headers: { "Accept-Language": "zh-CN" },
  });
  assert.equal(index.headers.get("location"), "/zh/");
});

test("request.cf.country takes precedence over the CF-IPCountry header fallback", async () => {
  const request = new Request("https://example.test/", {
    headers: { "CF-IPCountry": "US", "Accept-Language": "en" },
  });
  Object.defineProperty(request, "cf", { value: { country: "VN" } });
  const res = await worker.fetch(request, env);
  assert.equal(res.headers.get("location"), "/vi/");
});

test("worker never intercepts non-root paths, assets or non-read methods", async () => {
  env.ASSETS.calls.length = 0;
  const paths = [
    "/en/",
    "/en/products/",
    "/vi/privacy/",
    "/robots.txt",
    "/sitemap.xml",
    "/.well-known/security.txt",
    "/_astro/x.js",
    "/favicon.ico",
    "//",
    "/index.html/x",
  ];
  for (const path of paths) {
    const res = await call(path, { headers: { "CF-IPCountry": "VN" } });
    assert.equal(res, ASSET_SENTINEL, `${path} must pass through to ASSETS`);
  }
  const post = await call("/", { method: "POST", body: "x" });
  assert.equal(post, ASSET_SENTINEL);
  assert.equal(env.ASSETS.calls.length, paths.length + 1);
});

test("resolver failure fails open to the static chooser", async () => {
  const broken = new Request("https://example.test/");
  Object.defineProperty(broken.headers, "get", {
    value() {
      throw new Error("boom");
    },
  });
  assert.equal(await worker.fetch(broken, env), ASSET_SENTINEL);
});

test("worker code stores and logs nothing", () => {
  assert.doesNotMatch(
    workerSource,
    /console\.|Set-Cookie|caches\.|KV|waitUntil|fetch\(.*https?:/,
  );
});

test("negative proof: header guard catches a cacheable or Vary-less redirect", () => {
  const good = () =>
    new Response(null, {
      status: 302,
      headers: {
        Location: "/en/",
        "Cache-Control": "private, no-store",
        Vary: "Cookie, Accept-Language",
        ...Object.fromEntries(SECURITY_HEADERS),
      },
    });
  assert.deepEqual(redirectHeaderFindings(good()), []);
  const mutate = (fn) => {
    const r = good();
    fn(r.headers);
    return redirectHeaderFindings(r);
  };
  assert.ok(
    mutate((h) => h.set("Cache-Control", "public, max-age=3600")).length,
  );
  assert.ok(mutate((h) => h.delete("Vary")).length);
  assert.ok(mutate((h) => h.set("Vary", "Cookie")).length);
  assert.ok(mutate((h) => h.delete("Content-Security-Policy")).length);
  assert.ok(mutate((h) => h.append("Set-Cookie", "bsl_lang=vi")).length);
  assert.ok(redirectHeaderFindings(new Response(null, { status: 301 })).length);
});

test("Worker security headers mirror public/_headers /* exactly", () => {
  assert.deepEqual(securityParityFindings(headersFile, SECURITY_HEADERS), []);
});

test("negative proof: drift between _headers and the Worker mirror is caught", () => {
  const drifted = headersFile.replace(
    "X-Frame-Options: DENY",
    "X-Frame-Options: SAMEORIGIN",
  );
  assert.ok(securityParityFindings(drifted, SECURITY_HEADERS).length > 0);
  const missing = SECURITY_HEADERS.filter(
    ([n]) => n !== "Strict-Transport-Security",
  );
  assert.ok(securityParityFindings(headersFile, missing).length > 0);
});

test("static fallback chooser honours the cookie first and root stays noindex", () => {
  const root = read("src/pages/index.astro");
  assert.match(root, /readLanguageCookieValue\(document\.cookie\)/);
  assert.match(root, /initLanguageChoice/);
  assert.match(root, /noindex, follow/);
  assert.match(read("src/layouts/BaseLayout.astro"), /initLanguageChoice/);
  assert.doesNotMatch(
    read("src/components/layout/LanguageSwitcher.astro"),
    /bsl_lang/,
  );
});

test("the language-choice module is the only place that writes document.cookie", () => {
  const writers = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (
        /\.(ts|astro|mjs|js)$/.test(entry.name) &&
        /document\.cookie\s*=[^=]/.test(read(full))
      )
        writers.push(full);
    }
  };
  walk("src");
  assert.deepEqual(writers, [join("src", "scripts", "language-choice.ts")]);
});

test("negative proof: a stray cookie write elsewhere would be detected by the pattern", () => {
  assert.match("document.cookie = 'x=1'", /document\.cookie\s*=[^=]/);
  assert.doesNotMatch("document.cookie === ''", /document\.cookie\s*=[^=]/);
});

test("resolver export used by the Worker is the tested one", () => {
  assert.equal(typeof resolveLocale, "function");
  assert.match(workerSource, /from "\.\.\/lib\/locale-resolve\.ts"/);
});
