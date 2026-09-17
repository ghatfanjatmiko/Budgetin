import type { Config } from "tailwindcss";

const withOpacity = (varName: string) => `rgb(var(${varName}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: withOpacity("--color-paper"),
        ink: withOpacity("--color-ink"),
        ledger: withOpacity("--color-ledger"),
        mint: withOpacity("--color-mint"),
        "mint-deep": withOpacity("--color-ledger"),
        coin: withOpacity("--color-coin"),
        line: withOpacity("--color-line"),
        danger: withOpacity("--color-danger"),
        leaf: withOpacity("--color-leaf"),
        surface: withOpacity("--color-surface"),
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
