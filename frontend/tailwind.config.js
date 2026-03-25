/* global module:readonly */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/*/.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bordo: '#7B1C3E',
        krem: '#F5F0E8',
        bej: '#EDE8DE',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"Jost"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

