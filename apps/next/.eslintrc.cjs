/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["../../.eslintrc.cjs", "plugin:@next/next/recommended"],
  plugins: [
    "unused-imports",
    "simple-import-sort",
    "@typescript-eslint",
    "jsx-expressions",
  ],
  rules: {
    "jsx-expressions/strict-logical-expressions": "error",
  },
  ignorePatterns: ["src/utils/use-search-params.ts"],
};
