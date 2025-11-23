/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'uwp-primary': '#1e40af',
        'uwp-accent': '#3b82f6',
      },
      maxWidth: {
        'page': '1000px',
      },
      spacing: {
        'page-mobile': '32px',
        'page-desktop': '40px',
      },
    },
  },
  plugins: [],
}
