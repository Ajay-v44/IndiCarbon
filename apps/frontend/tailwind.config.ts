import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          950: "#0a1a12", 900: "#0d2418", 800: "#133320",
          700: "#1a4a2e", 600: "#22613c", 500: "#2d8250",
          400: "#3da668", 300: "#5bc88a", 200: "#84dda8",
          100: "#b3eec8", 50: "#e6f9ee",
        },
        accent: { 500: "#00d2e6", 400: "#33dcec", 300: "#66e6f2" },
        surface: {
          base: "#08110d", raised: "#0f1e15", overlay: "#162a1e",
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #5bc88a 0%, #33dcec 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
