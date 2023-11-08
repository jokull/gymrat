import type { Config } from "tailwindcss";

import { default as theme } from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      data: {
        active: 'headlessui-state~="active"',
        selected: 'headlessui-state~="selected"',
        workout: 'workout~="true"',
      },
      screens: {
        mobile: "380px",
      },
      fontFamily: {
        sans: ["Mona Sans", ...theme.fontFamily.sans],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
