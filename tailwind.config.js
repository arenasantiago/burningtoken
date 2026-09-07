/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tribunal: {
          dark: "#0a0a0f",
          card: "#12121c",
          border: "#252538",
          smoke: "#ef4444",
          legit: "#10b981",
          gold: "#f59e0b",
          neon: "#8b5cf6",
        },
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "gavel-hit": "gavel 0.3s ease-in-out",
      },
      keyframes: {
        gavel: {
          "0%": { transform: "rotate(-20deg)" },
          "50%": { transform: "rotate(30deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
      },
    },
  },
  plugins: [],
}
