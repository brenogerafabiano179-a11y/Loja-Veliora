/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bone: "rgb(var(--bone) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        graphite: "rgb(var(--graphite) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        anil: "rgb(var(--anil) / <alpha-value>)",
        sol: "rgb(var(--sol) / <alpha-value>)",
        coral: "rgb(var(--coral) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
      },
      fontFamily: {
        display: ['"Archivo"', '"Arial Narrow"', "sans-serif"],
        sans: ['"Archivo"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
        slab: ['"Alfa Slab One"', "Georgia", "serif"],
        script: ['"Yellowtail"', "cursive"],
        editorial: ['"Instrument Serif"', "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(20 20 19 / 0.04), 0 12px 32px -18px rgb(20 20 19 / 0.22)",
        lift: "0 2px 4px rgb(20 20 19 / 0.05), 0 30px 60px -28px rgb(20 20 19 / 0.35)",
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
        rise: { "0%": { transform: "translateY(10px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        shake: "shake 0.3s ease-in-out 2",
        rise: "rise .45s cubic-bezier(.2,.8,.2,1) both",
      },
    },
  },
  plugins: [],
};
