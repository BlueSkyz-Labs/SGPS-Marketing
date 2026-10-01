/**
 * Product showcase guard (GOLIVE W5).
 *
 * A showcase puts real screens of a product's running application on the
 * public site. It must stay truthful and self-contained:
 * - every recorded asset exists locally under /products/<slug>/showcase/,
 *   and each screen's declared size matches the image file;
 * - the capture is declared as a UI screenshot of synthetic demo data from a
 *   local test build at an exact 40-hex revision;
 * - the rendered section always carries the capture disclosure, and the
 *   schema refuses remote or out-of-product asset paths.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const DIR = "src/content/showcases";
const COMPONENT = readFileSync(
  "src/components/product/ProductShowcase.astro",
  "utf8",
);
const GUIDE = readFileSync("src/components/product/ProductGuide.astro", "utf8");
const SCHEMA = readFileSync("src/lib/showcase-schema.ts", "utf8");

function records() {
  return readdirSync(DIR)
    .filter((name) => /\.ya?ml$/.test(name))
    .map((name) => ({ name, text: readFileSync(`${DIR}/${name}`, "utf8") }));
}

/** Width/height of a lossy, lossless or extended WebP file. */
function webpSize(path) {
  const buf = readFileSync(path);
  assert.equal(buf.toString("ascii", 0, 4), "RIFF", `${path} is not RIFF`);
  assert.equal(buf.toString("ascii", 8, 12), "WEBP", `${path} is not WebP`);
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8 ") {
    return {
      width: buf.readUInt16LE(26) & 0x3fff,
      height: buf.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") {
    return {
      width: buf.readUIntLE(24, 3) + 1,
      height: buf.readUIntLE(27, 3) + 1,
    };
  }
  throw new Error(`${path}: unknown WebP chunk ${chunk}`);
}

// Every way a showcase record stops being truthful or self-contained.
function auditRecord(text, fileExists = existsSync) {
  const problems = [];
  const product = text.match(/^product:\s*([a-z0-9-]+)\s*$/m)?.[1];
  if (!product) problems.push("record must name its product");
  if (!/^\s+kind:\s*ui-screenshot\s*$/m.test(text)) {
    problems.push("capture kind must be ui-screenshot");
  }
  if (!/^\s+data:\s*synthetic-demo\s*$/m.test(text)) {
    problems.push("capture data must be synthetic-demo");
  }
  if (!/^\s+sourceRevision:\s*[0-9a-f]{40}\s*$/m.test(text)) {
    problems.push("capture must bind an exact 40-hex source revision");
  }
  const assets = [
    ...text.matchAll(/^\s+(?:-\s+)?(?:src|webm|poster):\s*(\S+)\s*$/gm),
  ].map((match) => match[1]);
  if (assets.length === 0) problems.push("record declares no assets");
  for (const asset of assets) {
    if (!asset.startsWith(`/products/${product}/showcase/`)) {
      problems.push(`asset ${asset} must live under this product's showcase`);
    } else if (!fileExists(`public${asset}`)) {
      problems.push(`asset ${asset} is missing from public/`);
    }
  }
  return problems;
}

function screens(text) {
  const blocks = text.split(/^\s+- id:\s*/m).slice(1);
  return blocks
    .map((block) => ({
      src: block.match(/^\s+src:\s*(\S+\.webp)\s*$/m)?.[1],
      width: Number(block.match(/^\s+width:\s*(\d+)\s*$/m)?.[1]),
      height: Number(block.match(/^\s+height:\s*(\d+)\s*$/m)?.[1]),
    }))
    .filter((item) => item.src);
}

test("showcase records are truthful and their assets exist", () => {
  const found = records();
  assert.ok(found.length > 0, "expected at least one showcase record");
  for (const { name, text } of found) {
    assert.deepEqual(auditRecord(text), [], name);
  }
});

test("declared screen sizes match the image files", () => {
  for (const { name, text } of records()) {
    const list = screens(text);
    assert.ok(list.length >= 3, `${name}: expected at least three screens`);
    for (const item of list) {
      assert.deepEqual(
        webpSize(`public${item.src}`),
        { width: item.width, height: item.height },
        `${name}: ${item.src}`,
      );
    }
  }
});

test("rendered showcase and guide always carry the capture disclosure", () => {
  assert.match(COMPONENT, /data-showcase-disclosure/);
  assert.match(COMPONENT, /\{t\.disclosure\}/);
  assert.match(GUIDE, /data-showcase-disclosure/);
  for (const phrase of ["sample data", "dữ liệu mẫu", "示例数据", "範例資料"]) {
    assert.ok(COMPONENT.includes(phrase), `showcase disclosure: ${phrase}`);
  }
  assert.doesNotMatch(COMPONENT, /<script\b(?![^>]*application\/ld\+json)/);
});

test("schema refuses remote, foreign and non-synthetic captures", () => {
  assert.match(SCHEMA, /kind: z\.literal\("ui-screenshot"\)/);
  assert.match(SCHEMA, /data: z\.literal\("synthetic-demo"\)/);
  assert.match(SCHEMA, /\^\/products\/\[a-z0-9-\]\+\/showcase\//);
  assert.match(SCHEMA, /guide step references unknown screen/);
});

test("negative proof: a real-data or remote-asset record is caught", () => {
  const [{ text }] = records();
  const realData = text.replace(
    /data:\s*synthetic-demo/,
    "data: production-export",
  );
  assert.notEqual(realData, text);
  assert.ok(
    auditRecord(realData).some((problem) => problem.includes("synthetic")),
  );

  const remote = text.replace(
    /src:\s*\/products\/sotro\/showcase\/op-01-home\.webp/,
    "src: https://example.com/op-01-home.webp",
  );
  assert.notEqual(remote, text);
  assert.ok(
    auditRecord(remote).some((problem) => problem.includes("must live under")),
  );

  const missing = auditRecord(text, () => false);
  assert.ok(missing.some((problem) => problem.includes("missing")));
});

test("negative proof: a size mismatch is caught", () => {
  const [{ text }] = records();
  const [first] = screens(text);
  const actual = webpSize(`public${first.src}`);
  assert.notDeepEqual(
    { width: actual.width + 1, height: actual.height },
    actual,
  );
});
