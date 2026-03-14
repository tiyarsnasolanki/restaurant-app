/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: "#e65c00", light: "#ff8c00", dark: "#b34500" },
        secondary:{ DEFAULT: "#1a1a2e", light: "#16213e" },
        accent:   { DEFAULT: "#27ae60", light: "#2ecc71" },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};
