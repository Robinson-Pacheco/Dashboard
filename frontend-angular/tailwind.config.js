/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
    "./src/app/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta institucional UTMACH
        // Universidad Tecnica de Machala - Colores corporativos
        'utmach': {
          blue: {
            DEFAULT: '#005ca2',
            50: '#e6f0f7',
            100: '#cce0ef',
            200: '#99c2df',
            300: '#66a3cf',
            400: '#3385bf',
            500: '#005ca2', // Pantone 301 EC
            600: '#004a82',
            700: '#003761',
            800: '#002541',
            900: '#001220',
          },
          sky: {
            DEFAULT: '#53aae1',
            50: '#edf6fc',
            100: '#dbedf9',
            200: '#b7dbf3',
            300: '#93c9ed',
            400: '#6fb7e7',
            500: '#53aae1', // Pantone 2925 EC
            600: '#2d9ad9',
            700: '#1f7eb3',
            800: '#175f86',
            900: '#0f3f5a',
          },
          red: {
            DEFAULT: '#C2354a',
            50: '#fbebed',
            100: '#f7d7db',
            200: '#efafb7',
            300: '#e78793',
            400: '#df5f6f',
            500: '#C2354a', // Pantone 185 EC
            600: '#9b2b3b',
            700: '#74202c',
            800: '#4e161d',
            900: '#270b0f',
          },
        },
      },
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

