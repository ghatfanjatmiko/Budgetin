import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F3EA",
        ink: "#1C2536",
        ledger: "#182338",
        mint: "#C9973E",
        "mint-deep": "#182338",
        coin: "#D9A94A",
        line: "#E5DFCF",
        danger: "#D2652F",
        leaf: "#2F8A55",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
