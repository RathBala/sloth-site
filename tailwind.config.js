/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.html', './src/**/*.js'],
  darkMode: 'class',
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
        'green-dark': '#038C73',
        'green-really-dark': '#012619',
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
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'gradient-shift': 'gradientShift 15s ease infinite',
        'gradient-text': 'gradientText 4s ease infinite',
        'pulse-slow': 'pulseSlow 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        gradientText: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
      backdropBlur: {
        xl: '24px',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.animate-gradient-shift': {
          'background-size': '200% 200%',
          'animation': 'gradientShift 15s ease infinite',
        },
        '.animate-gradient-text': {
          'background-size': '200% auto',
          'animation': 'gradientText 4s ease infinite',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}
