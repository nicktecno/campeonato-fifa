import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          dark: "#1a4d2e",
          mid: "#2d6a4f",
          light: "#40916c",
          line: "rgba(255,255,255,0.35)",
        },
        gold: "#f5c518",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "pitch-pattern":
          "repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(255,255,255,0.04) 49px, rgba(255,255,255,0.04) 50px)",
      },
    },
  },
  plugins: [],
};

export default config;
