import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import vitest from "@vitest/eslint-plugin";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-console": ["warn"],
      "@typescript-eslint/no-unused-vars": "warn"
    }
  },
  {
    files: ["**/*.test.ts"],
    plugins: { vitest },
    rules: { ...vitest.configs.recommended.rules }
  }
];
