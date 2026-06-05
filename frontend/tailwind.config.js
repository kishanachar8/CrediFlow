export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          700: '#4338ca',
        },
      },
      boxShadow: {
        glow: '0 25px 80px rgba(56, 189, 248, 0.18)',
      },
    },
  },
  plugins: [],
};
