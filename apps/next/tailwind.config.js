const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      data: {
        active: 'headlessui-state~="active"',
        selected: 'headlessui-state~="selected"',
      },
      screens: {
        mobile: "380px",
      },
      colors: {},
      fontFamily: {
        sans: ["Mona Sans", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
