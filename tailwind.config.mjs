/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        moveUpDown: {
          '0%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(40%)' },
          '100%': { transform: 'translateY(0%)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'move-up-down': 'moveUpDown 1.5s infinite ease-in-out',
      },
      boxShadow: {
        custom: "1px 1px 5px 0px rgba(168, 168, 168, 0.12)", // Added the custom box-shadow value
      },
    },
  },
  plugins: [],
};
