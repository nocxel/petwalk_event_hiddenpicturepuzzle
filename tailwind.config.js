/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        autumn: {
          50: '#fdf8f4',
          100: '#fbf0e8',
          200: '#f6dec9',
          300: '#efc39f',
          400: '#e59f6e',
          500: '#dc7f44',
          600: '#cd6533',
          700: '#ab4e2b',
          800: '#893f28',
          900: '#703623',
        },
        brand: {
          primary: '#8A5231', // Warm autumn amber/leather brown
          accent: '#E66A2B',  // Maple orange
          dark: '#3A2016',    // Deep chestnut
          gold: '#E5A93C',    // Autumn golden yellow
          cream: '#FFF9F2',   // Soft background cream
        }
      },
      animation: {
        'bounce-gentle': 'bounce 2s infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.7', transform: 'scale(1.08)' },
        }
      }
    },
  },
  plugins: [],
};
