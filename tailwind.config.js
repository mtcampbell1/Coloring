/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FDFBF7",
        ink: "#1F2937",
        peach: {
          50: "#FFF5EE",
          100: "#FFE7D6",
          200: "#FFD0B0",
          300: "#FFB585",
          400: "#FF9E63",
          500: "#F58450",
        },
        mint: {
          50: "#EEFBF4",
          100: "#D6F4E2",
          200: "#A9E5C0",
          300: "#7AD49C",
          400: "#4FC07B",
          500: "#34A864",
        },
        sky: {
          50: "#EEF6FF",
          100: "#D8EBFF",
          200: "#B7D9FF",
          300: "#8FC1FB",
          400: "#67A9F4",
          500: "#3F8FE5",
        },
        lilac: {
          50: "#F6F1FF",
          100: "#EADFFF",
          200: "#D5BEFF",
          300: "#BD9CF7",
          400: "#A47BEC",
          500: "#8A5FDC",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "ui-serif", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)",
        pop: "0 2px 6px rgba(15, 23, 42, 0.08), 0 16px 40px rgba(15, 23, 42, 0.10)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
