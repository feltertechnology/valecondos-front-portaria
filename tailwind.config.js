/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Satoshi', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        ink: {
          50: '#E8F6FF', 100: '#C9EBFF', 200: '#8FD8FF', 300: '#4FC0FF',
          400: '#15A8F5', 500: '#008DDE', 600: '#0070B8', 700: '#0A578C',
          800: '#12384F', 900: '#0B1824', 950: '#050A0F',
        },
        champagne: {
          50: '#E8F6FF', 100: '#C9EBFF', 200: '#8FD8FF', 300: '#4FC0FF',
          400: '#159FEA', 500: '#0087D8', 600: '#006CB0', 700: '#095486',
          800: '#0E3650', 900: '#071B2B',
        },
        navy: {
          50: '#E8F6FF', 100: '#C9EBFF', 200: '#8FD8FF', 300: '#4FC0FF',
          400: '#15A8F5', 500: '#008DDE', 600: '#0070B8', 700: '#0A578C',
          800: '#12384F', 900: '#0B1824', 950: '#050A0F',
        },
        cyan: {
          50: '#E8F6FF', 100: '#C9EBFF', 200: '#8FD8FF', 300: '#4FC0FF',
          400: '#15A8F5', 500: '#008DDE', 600: '#0070B8', 700: '#0A578C',
          800: '#12384F', 900: '#0B1824', 950: '#050A0F',
        },
        gold: {
          50: '#E8F6FF', 100: '#C9EBFF', 200: '#8FD8FF', 300: '#4FC0FF',
          400: '#15A8F5', 500: '#008DDE', 600: '#0070B8', 700: '#0A578C',
          800: '#12384F', 900: '#0B1824', 950: '#050A0F',
        },
        brand: {
          50: '#E8F6FF', 100: '#C9EBFF', 200: '#8FD8FF', 300: '#4FC0FF',
          400: '#15A8F5', 500: '#008DDE', 600: '#0070B8', 700: '#0A578C',
          800: '#12384F', 900: '#0B1824', 950: '#050A0F',
        },
        cream: {
          50: '#FFFFFF', 100: '#E8F6FF', 200: '#C9EBFF', 300: '#8FD8FF',
          400: '#4FC0FF', 500: '#15A8F5',
        },
        slate: {
          300: '#C9EBFF', 400: '#8FD8FF', 500: '#4FC0FF', 600: '#15A8F5',
        },
        steel: { 400: '#8FD8FF', 500: '#4FC0FF', 600: '#15A8F5' },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(21,168,245,0.16)' },
          '50%': { boxShadow: '0 0 40px rgba(21,168,245,0.34)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out',
        twinkle: 'twinkle 2.4s ease-in-out infinite',
        glow: 'glow 3s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-graphite': 'linear-gradient(135deg, #050A0F 0%, #0B1824 52%, #12384F 100%)',
        'gradient-champagne': 'linear-gradient(135deg, #008DDE 0%, #4FC0FF 50%, #15A8F5 100%)',
      },
    },
  },
  plugins: [],
};
