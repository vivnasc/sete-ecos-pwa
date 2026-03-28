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
        terracotta: {
          DEFAULT: "#C2703E",
          dark: "#A85A2A",
          light: "#D4905E",
        },
        olive: {
          DEFAULT: "#6B7F4E",
          light: "#8FA86A",
          pale: "#E8EDDF",
        },
        cream: {
          DEFAULT: "#FBF7F0",
          dark: "#F0E8D8",
        },
        "warm-white": "#FFFDF8",
        charcoal: {
          DEFAULT: "#2D2A26",
          light: "#4A4640",
        },
        stone: {
          DEFAULT: "#8C8578",
          light: "#B8B0A4",
        },
        rose: {
          DEFAULT: "#D4726A",
          light: "#F0A8A2",
        },
        gold: {
          DEFAULT: "#C9A96E",
          light: "#E0C88E",
        },
      },
      fontFamily: {
        display: ["DM Serif Display", "serif"],
        body: ["Nunito", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
      maxWidth: {
        app: "440px",
      },
    },
  },
  plugins: [],
};
export default config;
