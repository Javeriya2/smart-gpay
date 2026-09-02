/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gpay: {
          blue: '#1a73e8',
          darkBlue: '#1557b0',
          lightBlue: '#e8f0fe',
          accent: '#00d2ff',
          emerald: '#10b981',
          purple: '#8b5cf6',
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(26, 115, 232, 0.4)',
        'glow-teal': '0 0 25px -5px rgba(0, 210, 255, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
