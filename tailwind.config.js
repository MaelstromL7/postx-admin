/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0D1117",
        accent: "#00B4D8",
        light: "#F3F4F6",
      },
    },
  },
  plugins: [],
}
