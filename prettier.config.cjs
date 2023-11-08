/** @type {import("prettier").Config & { [key:string]: any }} */
const config = {
  tailwindConfig: "tailwind.config.ts",
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  importOrder: [
    "<BUILT_IN_MODULES>",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "@trip/(.*)$",
    "",
    "^~/(.*)$",
    "",
    "^[./]",
  ],
};

module.exports = config;
