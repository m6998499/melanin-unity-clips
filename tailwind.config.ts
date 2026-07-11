import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ember: "#0fbf73",
        ink: "#050505",
        palm: "#0d7f48",
        ruby: "#c2292e",
      },
      boxShadow: {
        glow: "0 0 32px rgba(214, 169, 58, 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
