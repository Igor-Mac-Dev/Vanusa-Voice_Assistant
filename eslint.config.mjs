// https://www.youtube.com/watch?v=413C1PlYIko
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import jest from "eslint-plugin-jest";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";

export default [
  { ignores: ["dist/"] },
  { files: ["src/**/*.{js,ts,jsx,tsx}", "tests/**/*.{js,ts,jsx,tsx}"] },
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["tests/**/*.{js,ts,jsx,tsx}"],
    ...jest.configs["flat/recommended"],
    rules: {
      ...jest.configs["flat/recommended"].rules,
      "jest/prefer-expect-assertions": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  eslint - plugin - prettier / recommended,
];
