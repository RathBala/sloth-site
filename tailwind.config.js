/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.html", "./src/assets/js/**/*.js"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-to-b-green":
          "linear-gradient(to bottom, #04bf68 0%, #04bf68 100%)",
      },
      colors: {
        "blue-dark": "#0b1930",
        "green-light": "#96f294",
        green: "#04bf68",
      },
      fontFamily: {
        sans: ["Merriweather Sans", "sans-serif"],
        serif: ["Roboto", "serif"],
      },
      height: {
        "1/2vh": "50vh",
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
        "[55%]": "55%",
      },
      translate: {
        "[185%]": "185%",
      },
      width: {
        "[8%]": "8%",
        "[1vw]": "1vw",
      },
    },
  },
  plugins: [],
};
