/** @type {import('tailwindcss').Config} */
module.exports = {
  /* safelist will include Tailwind classes in the app bundle even
    if they don't appear in the app's markup; a safelist is needed
    if classes are added dynamically through JavaScript code but
    do not appear in HTML files */
  safelist: [
    'bg-blue-400', 'bg-green-400', 'bg-red-400'
  ],
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: []
}