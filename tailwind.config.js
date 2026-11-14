/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mano: ["Caveat", "cursive"],
        cuerpo: ["Nunito", "system-ui", "sans-serif"],
      },
      colors: {
        papel: "#faf6ee",
        tinta: "#3a3145",
        lomo: "#8b7fa8",
        refugio: {
          lavanda: "#c9b8e8",
          durazno: "#f5c9a8",
          salvia: "#b8d4c2",
        },
      },
      backgroundImage: {
        "textura-papel":
          "repeating-linear-gradient(0deg, rgba(58,49,69,0.03) 0px, rgba(58,49,69,0.03) 1px, transparent 1px, transparent 32px)",
      },
    },
  },
  plugins: [],
};
