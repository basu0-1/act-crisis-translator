/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hazard: {
          red: "#DC2626",
          darkred: "#991B1B",
          amber: "#D97706",
          green: "#16A34A",
          blue: "#2563EB",
          dark: "#0F172A",
          card: "#1E293B",
          cardBorder: "#334155"
        }
      }
    },
  },
  plugins: [],
}