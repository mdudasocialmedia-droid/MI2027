import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FFF9F0",
        violet: "#7954F6",
        coral: "#FF6B78",
        yellow: "#FFD76A",
        mint: "#76DCC0",
        ink: "#182142"
      },
      fontFamily: {
        display: ["Plus Jakarta Sans Variable", "sans-serif"],
        body: ["Inter Variable", "sans-serif"]
      },
      boxShadow: {
        card: "0 18px 55px rgba(73, 55, 108, 0.09)",
        soft: "0 10px 30px rgba(121, 84, 246, 0.18)"
      },
      keyframes: {
        float: { "0%, 100%": { transform: "translateY(0) rotate(0deg)" }, "50%": { transform: "translateY(-8px) rotate(4deg)" } },
        pop: { "0%": { transform: "scale(.85)", opacity: "0" }, "100%": { transform: "scale(1)", opacity: "1" } }
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        pop: "pop .25s ease-out"
      }
    }
  },
  plugins: []
} satisfies Config;
