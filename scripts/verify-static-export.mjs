import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { findUnpublishedProductNameLeaks } from "./product-publication-output.mjs";

for (const file of ["dist/index.html", "dist/404.html"]) {
  assert.ok(existsSync(file), `${file} must exist`);
  assert.ok(statSync(file).size > 0, `${file} must not be empty`);
}

assert.ok(existsSync("dist/_headers"), "dist/_headers must exist");

function collectTextOutputs(directory, parent = "") {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = parent ? `${parent}/${entry.name}` : entry.name;
    const fullPath = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return collectTextOutputs(fullPath, path);
    if (!/\.(?:html|json|txt)$/i.test(entry.name)) return [];
    return [{ path, contents: readFileSync(fullPath, "utf8") }];
  });
}

const products = readdirSync("src/content/products", {
  withFileTypes: true,
})
  .filter((entry) => entry.isFile() && entry.name.endsWith(".yaml"))
  .map((entry) => {
    const source = readFileSync(`src/content/products/${entry.name}`, "utf8");
    const nameMatch = source.match(/^name:\s*(.+)\s*$/m);
    const publicMatch = source.match(/^public:\s*(true|false)\s*$/m);
    assert.ok(
      nameMatch && publicMatch,
      `${entry.name} needs name/public fields`,
    );
    return {
      name: nameMatch[1].trim().replace(/^['"]|['"]$/g, ""),
      public: publicMatch[1] === "true",
    };
  });

const leaks = findUnpublishedProductNameLeaks(
  products,
  collectTextOutputs("dist"),
);
assert.deepEqual(
  leaks,
  [],
  "unpublished product names must not enter public text outputs",
);

console.log("Static export verified");
