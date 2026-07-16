/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./company-profile/*.html",
    "./company-profile/**/*.html",
    "./js/**/*.js"
  ],
  darkMode: 'class', // Enable dark mode manually using a 'dark' class on HTML
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#019340',
          light: '#017a35',
        },
        secondary: '#5BA7D1',
        accent: {
          DEFAULT: '#F28C28',
          hover: '#d97b1f',
        },
        highlight: '#A8CF6A',
        decorative: '#C94A7A',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
