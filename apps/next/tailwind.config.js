/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    data: {
      active: 'headlessui-state~="active"',
      selected: 'headlessui-state~="selected"',
    },
    extend: {
      colors: {},
    },
  },
  plugins: [],
};
