/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // All driven by CSS variables so dark/light theme works without rewriting components
        bg:      'rgb(var(--c-bg)      / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        border:  'rgb(var(--c-border)  / <alpha-value>)',
        teal:    'rgb(var(--c-teal)    / <alpha-value>)',
        blue:    'rgb(var(--c-blue)    / <alpha-value>)',
        orange:  'rgb(var(--c-orange)  / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        logo: ['"DM Serif Display"', 'serif'],
      }
    }
  },
  plugins: []
}
