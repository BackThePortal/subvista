const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      "./index.html",
      "./src/**/*.{vue,ts,js}"
  ],
  theme: {
    extend: {
        fontFamily: {
            sans: [
                'Nunito', ...defaultTheme.fontFamily.sans
            ]
        },
        maxWidth: {
            '8xl': '88rem',
        },
    },
  },
  plugins: [],
}

