/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./options.html', './popup.html'],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        'primary-hover': '#e55a2b',
      },
    },
  },
  plugins: [],
};
