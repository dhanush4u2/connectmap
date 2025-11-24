/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#1a0f0a',
          elevated: '#241813',
          warm: '#2d1e16',
        },
        primary: {
          DEFAULT: '#ff6b2c',
          light: '#ff8c5a',
          dark: '#e55a1f',
        },
        accent: {
          orange: '#ff6b2c',
          yellow: '#ffb340',
          red: '#ff4545',
          warm: '#ffd89b',
        },
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 20px 50px rgba(0,0,0,0.5)',
        glow: '0 0 30px rgba(255, 107, 44, 0.3)',
        'glow-lg': '0 0 50px rgba(255, 107, 44, 0.4)',
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #ff6b2c 0%, #ffb340 100%)',
        'gradient-fire': 'linear-gradient(135deg, #ff4545 0%, #ff6b2c 50%, #ffb340 100%)',
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
