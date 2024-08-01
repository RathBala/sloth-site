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
      fontSize: {
        "[22px]": "22px",
        "[56px]": "56px",
        "[92px]": "92px",
      },
      height: {
        "1/2vh": "50vh",
      },
      lineHeight: {
        "[110%]": "110%",
        "[140%]": "140%",
      },
      maxWidth: {
        "[375px]": "375px",
        "[624px]": "624px",
      },
      spacing: {
        "20vh": "20vh",
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
