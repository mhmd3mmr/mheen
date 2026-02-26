import type { Config } from "tailwindcss";

/**
 * Mheen Memory Archive — Tailwind design tokens (reference).
 * Tailwind v4 uses @theme in globals.css for actual utilities;
 * this file documents the palette and can be used with @config if needed.
 */
const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#054239",       // Forest Teal
        secondary: "#988561",     // Golden Wheat Olive
        accent: "#b9a779",        // Golden Wheat
        background: "#edebe0",    // Cream
        foreground: "#002623",    // Dark Forest
        success: "#428177",       // Forest Light
      },
      fontFamily: {
        qomra: ["var(--font-qomra)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
