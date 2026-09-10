/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        polar: {
          dark: '#0a0f1d',
          card: '#111827',
          border: '#1e293b',
          cyan: '#06b6d4',
          ice: '#38bdf8',
          subzero: '#6366f1',
          accent: '#0284c7'
        }
      }
    },
  },
  plugins: [],
}
