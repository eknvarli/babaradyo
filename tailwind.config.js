export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dde8ff',
          200: '#c3d5ff',
          300: '#9ab8ff',
          400: '#6d92ff',
          500: '#4a6cf7',
          600: '#3550ed',
          700: '#2b3fd9',
          800: '#2835af',
          900: '#27318a',
        },
        dark: {
          950: '#050508',
          900: '#0d0d14',
          800: '#131320',
          700: '#1a1a2e',
          600: '#1e1e3a',
          500: '#252545',
        },
        spotify: {
          bg:     '#121212',
          card:   '#181818',
          hover:  '#282828',
          green:  '#1db954',
          text:   '#ffffff',
          muted:  '#b3b3b3',
          subtle: '#535353',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':   'spin 3s linear infinite',
        'fade-in':     'fadeIn 0.3s ease-in-out',
        'slide-up':    'slideUp 0.3s ease-out',
        'eq1':         'eq1 0.9s ease-in-out infinite',
        'eq2':         'eq2 0.7s ease-in-out infinite',
        'eq3':         'eq3 1.1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        eq1: {
          '0%, 100%': { height: '4px'  },
          '50%':      { height: '14px' },
        },
        eq2: {
          '0%, 100%': { height: '8px'  },
          '50%':      { height: '20px' },
        },
        eq3: {
          '0%, 100%': { height: '6px'  },
          '50%':      { height: '16px' },
        },
      },
    },
  },
  plugins: [],
}
