import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { productSchema } from "@/lib/product-schema";
import path from "node:path";

const products = defineCollection({
  loader: glob({
    pattern: "**/*.{yaml,yml,json}",
    base: "./src/content/products",
  }),
  schema: productSchema,
});

const pages = defineCollection({
  loader: glob({
    pattern: "**/*.{yaml,yml,json}",
    base: "./src/content/pages",
    generateId: ({ entry }) => {
      const { dir, name } = path.posix.parse(entry);
      const prefix = dir ? `${dir.replace(/\//g, "-")}-` : "";
      return `${prefix}${name}`;
    },
  }),
  schema: z.object({
    lang: z.enum(["en", "vi"]),
    title: z.string().min(1),
    description: z.string().min(1).max(200),
    slug: z.string().min(1),
    sections: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const collections = { products, pages };
