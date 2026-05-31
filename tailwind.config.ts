/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          violet: '#6771ab',
          'violet-light': '#8b93c5',
          'violet-dark': '#4a5280',
          'violet-container': '#eef0f7',
          yellow: '#ffcc00',
          cream: '#fefce8',
          rose: '#c484b0',
          'rose-container': '#fce4f0',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        }
      },
      borderRadius: {
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}
