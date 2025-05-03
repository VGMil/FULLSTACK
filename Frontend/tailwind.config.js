/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {

    extend: {
      colors: {
        transparent: 'transparent',
        dark: '#1A1F2C',
        primary: {
          DEFAULT: '#0EA5E9',
          100: '#e0f5fe',
          200: '#bae8fd',
          300: '#7dd5fc',
          400: '#38bcf8',
          500: '#0ea5e9',
        },
        secondary: {
          DEFAULT: '#f1f5f9',
          100: '#e9eff5',
          200: '#cedde9',
          300: '#a3c0d6',
          400: '#729fbe',
          500: '#5083a7',
        },
        success: {
          DEFAULT: '#4ade80',
          100: '#dcfce8',
          200: '#bbf7d1',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55d',
        },
      },
    },
  },
  plugins: [],
}