/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jet: '#050505',
        'surface-1': '#0A0612',
        'surface-2': '#120A22',
        'surface-3': '#1A0F30',
        amethyst: {
          DEFAULT: '#3B0A6B',
          50: '#F3E8FF',
          100: '#E9D5FF',
          200: '#D8B4FE',
          300: '#7B3FCF',
          400: '#5C16A3',
          500: '#3B0A6B',
          600: '#2E0654',
          700: '#230440',
          800: '#1A0230',
          900: '#110120',
        },
        cyan: {
          DEFAULT: '#00E5FF',
          50: '#E0F7FA',
          100: '#B2EBF2',
          200: '#80DEEA',
          300: '#4DF3FF',
          400: '#00E5FF',
          500: '#00B8D4',
          600: '#0097A7',
          700: '#00838F',
          800: '#006064',
          900: '#004D40',
        },
        text: {
          1: '#F5F3FF',
          2: '#B9B0D4',
          3: '#7D7396',
        },
        success: '#2EE59D',
        danger: '#FF4D6D',
        gold: '#FFC857',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['Rajdhani', 'monospace'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan-sm': '0 0 10px rgba(0, 229, 255, 0.35)',
        'glow-cyan-md': '0 0 22px rgba(0, 229, 255, 0.5)',
        'glow-cyan-lg': '0 0 35px rgba(0, 229, 255, 0.65)',
        'glow-amethyst': '0 0 40px rgba(59, 10, 107, 0.6)',
        'glow-amethyst-sm': '0 0 15px rgba(59, 10, 107, 0.45)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.55)',
        'glass-lift': '0 12px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 229, 255, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
