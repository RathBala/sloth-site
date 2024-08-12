/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.html', './src/assets/js/**/*.js'],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-to-b-green':
          'linear-gradient(to bottom, #04bf68 0%, #04bf68 100%)',
      },
      colors: {
        'blue-dark': '#0b1930',
        'blue-light': '#4B92FE',
        'blue-really-light': '#ADD8E6',
        'green-light': '#96f294',
        green: '#04bf68',
      },
      fontFamily: {
        sans: ['Merriweather Sans', 'sans-serif'],
        serif: ['Roboto', 'serif'],
      },
      height: {
        '1/2vh': '50vh',
      },
      spacing: {
        '20vh': '20vh',
        '1rem': '1rem',
        '1.5rem': '1.5rem',
        '2rem': '2rem',
        '10rem': '10rem',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      }
      addUtilities(newUtilities)
    },
  ],
}
