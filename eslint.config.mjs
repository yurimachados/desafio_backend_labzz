import pluginJs from "@eslint/js";
import pluginPrettier from "eslint-plugin-prettier";
import { configs as tsconfigs } from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  { ignores: ["dist/"] },
  { files: ["**/*.{js,mjs,cjs,ts}"], ignores: ["dist/"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { files: ["**/*.mjs"], languageOptions: { sourceType: "module" } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tsconfigs.recommended,
  prettier,
  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
];
