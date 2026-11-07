/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: 'var(--bg-main)',
          surface: 'var(--bg-surface)',
          'surface-hover': 'var(--bg-surface-hover)',
          amber: '#F5B83D',
          green: '#2FBF71',
          blue: '#4DA3FF',
          text: 'var(--text-main)',
          'text-muted': 'var(--text-muted)',
          coral: '#FF6B6B',
          border: 'var(--border-color)',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(18, 21, 41, 0.35)',
        card: '0 4px 20px rgba(18, 21, 41, 0.25)',
        amber: '0 4px 18px rgba(245, 184, 61, 0.28)',
        green: '0 4px 18px rgba(47, 191, 113, 0.28)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
};

