import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// RT-07: the CSP enforces `require-trusted-types-for 'script'`. Any string
// assignment to a Trusted-Types sink would throw in Chromium, so the source
// must not contain one. This static ban keeps the header safe to ship.
const SINKS = [
  { name: "innerHTML", re: /\.\s*innerHTML\s*(?:\+|=(?!=))/ },
  { name: "outerHTML", re: /\.\s*outerHTML\s*(?:\+|=(?!=))/ },
  { name: "insertAdjacentHTML", re: /\.\s*insertAdjacentHTML\s*\(/ },
  { name: "document.write", re: /\bdocument\s*\.\s*write(?:ln)?\s*\(/ },
  { name: "eval", re: /(?<![\w.])eval\s*\(/ },
  { name: "new Function", re: /\bnew\s+Function\s*\(/ },
  { name: "Function(", re: /(?<![\w.])Function\s*\(\s*["'`]/ },
  { name: "string timer", re: /\bset(?:Timeout|Interval)\s*\(\s*["'`]/ },
  { name: "srcdoc", re: /\.\s*srcdoc\s*=(?!=)/ },
  {
    name: "script text/src",
    re: /\bscript\w*\s*\.\s*(?:text|textContent|src)\s*=(?!=)/i,
  },
  { name: "createContextualFragment", re: /createContextualFragment\s*\(/ },
  { name: "DOMParser", re: /\bnew\s+DOMParser\s*\(/ },
  { name: "setHTMLUnsafe", re: /\.\s*(?:setHTMLUnsafe|parseHTMLUnsafe)\s*\(/ },
  { name: "createElement script", re: /createElement\s*\(\s*["'`]script["'`]/ },
];

const findSinks = (text) =>
  SINKS.filter(({ re }) => re.test(text)).map(({ name }) => name);

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return walk(path);
    return /\.(?:astro|ts|tsx|js|mjs|html)$/.test(path) ? [path] : [];
  });

test("src/ has no Trusted-Types-enforced sink", () => {
  const offenders = walk("src").flatMap((file) =>
    findSinks(readFileSync(file, "utf8")).map((s) => `${file}: ${s}`),
  );
  assert.deepEqual(offenders, []);
});

test("public/ scripts have no Trusted-Types-enforced sink", () => {
  const offenders = readdirSync("public")
    .filter((f) => f.endsWith(".js"))
    .flatMap((file) =>
      findSinks(readFileSync(join("public", file), "utf8")).map(
        (s) => `public/${file}: ${s}`,
      ),
    );
  assert.deepEqual(offenders, []);
});

test("negative proof: the sink ban rejects representative violations", () => {
  const bad = [
    "el.innerHTML = x;",
    "el.innerHTML += x;",
    "el.outerHTML = x;",
    "el.insertAdjacentHTML('beforeend', x);",
    "document.write(x);",
    "eval(x);",
    "new Function('return 1');",
    "setTimeout('alert(1)', 0);",
    "frame.srcdoc = x;",
    "script.src = x;",
    "range.createContextualFragment(x);",
    "new DOMParser().parseFromString(x, 'text/html');",
    "document.createElement('script');",
  ];
  for (const fixture of bad) {
    assert.ok(findSinks(fixture).length > 0, `not rejected: ${fixture}`);
  }
  const good = [
    "el.textContent = x;",
    "el.replaceChildren(node);",
    "if (el.innerHTML === '') {}",
    "setTimeout(() => run(), 0);",
    "a.href = path;",
  ];
  for (const fixture of good) {
    assert.deepEqual(findSinks(fixture), [], `false positive: ${fixture}`);
  }
});
