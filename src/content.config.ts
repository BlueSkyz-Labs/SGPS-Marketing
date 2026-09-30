import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { productSchema } from "@/lib/product-schema";
import { showcaseSchema } from "@/lib/showcase-schema";
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
    lang: z.enum(["en", "vi", "zh", "zh-hant"]),
    title: z.string().min(1),
    description: z.string().min(1).max(200),
    slug: z.string().min(1),
    sections: z.record(z.string(), z.unknown()).optional(),
  }),
});

const showcases = defineCollection({
  loader: glob({
    pattern: "**/*.{yaml,yml,json}",
    base: "./src/content/showcases",
  }),
  schema: showcaseSchema,
});

export const collections = { products, pages, showcases };
