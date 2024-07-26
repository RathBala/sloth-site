/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.html", "./src/assets/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        "blue-dark": "#0b1930",
        green: "#04bf68",
      },
      fontFamily: {
        sans: ["Merriweather Sans", "sans-serif"],
        serif: ["Roboto", "serif"],
      },
      lineHeight: {
        "[115%]": "115%",
        "[140%]": "140%",
      },
      maxWidth: {
        "max-w-700px": "700px",
      },
      spacing: {
        "10rem": "10rem",
        150: "1.5rem",
        200: "2rem",
      },
    },
  },
  plugins: [],
};
