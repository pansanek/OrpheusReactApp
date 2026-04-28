// eslint.config.js
const nextPlugin = require("@next/eslint-plugin-next");
const tseslint = require("typescript-eslint");

module.exports = [
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      "@next/next/no-html-link-for-pages": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "coverage/**",
      "public/**",
      "*.config.*",
      "tests/**", // Тесты линтятся отдельно или игнорируются
    ],
  },
];
