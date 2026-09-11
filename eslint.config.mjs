import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "dist/**",
      ".astro/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      ".lighthouseci/**",
      ".worktrees/**",
      ".hermes/**",
    ],
  },
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs["flat/recommended"],
];
