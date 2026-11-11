/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        teal: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.215,0.61,0.355,1) infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%':   { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(13,148,136,0.7)' },
          '70%':  { transform: 'scale(1)',    boxShadow: '0 0 0 10px rgba(13,148,136,0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(13,148,136,0)' },
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #f0fdfa 0%, #eff6ff 50%, #f0fdfa 100%)',
        'card-gradient': 'linear-gradient(135deg, #0d9488 0%, #2563eb 100%)',
      },
    },
  },
  plugins: [],
}
