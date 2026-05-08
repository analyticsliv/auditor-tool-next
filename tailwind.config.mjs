/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        "3xl": "1920px",
        "4xl": "2400px",
      },
      colors: {
        // Semantic tokens (driven by CSS variables in globals.css)
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          muted: "rgb(var(--surface-muted) / <alpha-value>)",
          hover: "rgb(var(--surface-hover) / <alpha-value>)",
          elevated: "rgb(var(--surface-elevated) / <alpha-value>)",
        },
        content: {
          DEFAULT: "rgb(var(--content) / <alpha-value>)",
          muted: "rgb(var(--content-muted) / <alpha-value>)",
          subtle: "rgb(var(--content-subtle) / <alpha-value>)",
          inverse: "rgb(var(--content-inverse) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          strong: "rgb(var(--border-strong) / <alpha-value>)",
        },
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          hover: "rgb(var(--brand-hover) / <alpha-value>)",
          muted: "rgb(var(--brand-muted) / <alpha-value>)",
          foreground: "rgb(var(--brand-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--success) / <alpha-value>)",
          muted: "rgb(var(--success-muted) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--warning) / <alpha-value>)",
          muted: "rgb(var(--warning-muted) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--danger) / <alpha-value>)",
          muted: "rgb(var(--danger-muted) / <alpha-value>)",
        },
        // Chart palette (recharts)
        chart: {
          1: "rgb(var(--chart-1) / <alpha-value>)",
          2: "rgb(var(--chart-2) / <alpha-value>)",
          3: "rgb(var(--chart-3) / <alpha-value>)",
          4: "rgb(var(--chart-4) / <alpha-value>)",
          5: "rgb(var(--chart-5) / <alpha-value>)",
          6: "rgb(var(--chart-6) / <alpha-value>)",
          grid: "rgb(var(--chart-grid) / <alpha-value>)",
          axis: "rgb(var(--chart-axis) / <alpha-value>)",
        },
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        moveUpDown: {
          "0%": { transform: "translateY(0%)" },
          "50%": { transform: "translateY(40%)" },
          "100%": { transform: "translateY(0%)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "float-slow": {
          "0%,100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(0.6deg)" },
        },
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" },
        },
        "needle-sweep": {
          "0%": { transform: "rotate(-135deg)" },
          "100%": { transform: "rotate(45deg)" },
        },
        "shine": {
          "0%": { backgroundPosition: "200% 50%" },
          "100%": { backgroundPosition: "-200% 50%" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "move-up-down": "moveUpDown 1.5s infinite ease-in-out",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        "rise-in": "rise-in 700ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "needle-sweep": "needle-sweep 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "shine": "shine 6s linear infinite",
      },
      boxShadow: {
        custom: "1px 1px 5px 0px rgba(168, 168, 168, 0.12)",
      },
    },
  },
  plugins: [],
};
