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
      // Throwaway parity fixture app: synthetic data, never shipped, not typechecked.
      "tests/e2e/fixtures/parity-app/**",
      ".lighthouseci/**",
      ".worktrees/**",
      ".hermes/**",
    ],
  },
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs["flat/recommended"],
];
