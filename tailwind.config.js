/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{html,vue,ts,js}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B'
        }
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        popup: '20px'
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.08)',
        popup: '0 8px 40px rgba(0, 0, 0, 0.12)'
      },
      transitionDuration: {
        DEFAULT: '200ms'
      },
      gridTemplateColumns: {
        settings: '1fr 340px'
      }
    }
  },
  plugins: []
}