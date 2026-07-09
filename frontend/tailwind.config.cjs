/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: 'var(--brand-bg)',
          panel: 'var(--brand-panel)',
          border: 'var(--brand-border)',
          text: 'var(--brand-text)',
          muted: 'var(--brand-muted)',
          accent: 'var(--brand-accent)',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          indigo: '#6366F1'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
