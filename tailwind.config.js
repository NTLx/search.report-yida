/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/react");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--nextui-background)",
        foreground: "var(--nextui-foreground)",
        primary: {
          DEFAULT: "var(--nextui-primary)",
          foreground: "var(--nextui-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--nextui-secondary)",
          foreground: "var(--nextui-secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--nextui-muted)",
          foreground: "var(--nextui-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--nextui-accent)",
          foreground: "var(--nextui-accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--nextui-destructive)",
          foreground: "var(--nextui-destructive-foreground)",
        },
        border: "var(--nextui-border)",
        input: "var(--nextui-input)",
        ring: "var(--nextui-ring)",
        content1: "var(--nextui-content1)",
        content2: "var(--nextui-content2)",
        content3: "var(--nextui-content3)",
        content4: "var(--nextui-content4)",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};