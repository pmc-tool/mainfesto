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
        'uwp-primary': '#00AB50',
        'uwp-secondary': '#FFEB3C',
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
