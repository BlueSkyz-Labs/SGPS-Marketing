import { readFileSync, readdirSync } from "node:fs";

export function readProductPublicationRecords(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".yaml"))
    .map((entry) => {
      const source = readFileSync(`${directory}/${entry.name}`, "utf8");
      const nameMatch = source.match(/^name:\s*(.+)\s*$/m);
      const publicMatch = source.match(/^public:\s*(true|false)\s*$/m);
      if (!nameMatch || !publicMatch) {
        throw new Error(`${entry.name} needs name/public fields`);
      }
      return {
        name: nameMatch[1].trim().replace(/^['"]|['"]$/g, ""),
        public: publicMatch[1] === "true",
      };
    });
}

export function findUnpublishedProductNameLeaks(products, outputs) {
  const unpublishedProducts = products.filter((product) => !product.public);

  return outputs.flatMap(({ path, contents }) =>
    unpublishedProducts
      .filter((product) =>
        contents.toLocaleLowerCase().includes(product.name.toLocaleLowerCase()),
      )
      .map((product) => `${path}: ${product.name}`),
  );
}

export function findUnpublishedProductNameLeaksInDirectory(
  products,
  directory,
) {
  function collectTextOutputs(currentDirectory, parent = "") {
    return readdirSync(currentDirectory, { withFileTypes: true }).flatMap(
      (entry) => {
        const path = parent ? `${parent}/${entry.name}` : entry.name;
        const fullPath = `${currentDirectory}/${entry.name}`;
        if (entry.isDirectory()) return collectTextOutputs(fullPath, path);
        if (!/\.(?:html|json|txt)$/i.test(entry.name)) return [];
        return [{ path, contents: readFileSync(fullPath, "utf8") }];
      },
    );
  }

  return findUnpublishedProductNameLeaks(
    products,
    collectTextOutputs(directory),
  );
}
