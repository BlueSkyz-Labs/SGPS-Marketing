import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function getPublicProductCount(dir = "src/content/products"): number {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir)
    .filter((f) => /\.(yaml|yml)$/i.test(f))
    .filter((f) => {
      const content = readFileSync(join(dir, f), "utf8");
      return /^\s*public:\s*true\s*$/m.test(content);
    }).length;
}

export const hasPublicProducts = getPublicProductCount() > 0;
