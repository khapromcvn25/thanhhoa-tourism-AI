/** @type {import('tailwindcss').Config} */

// Màu ngữ nghĩa lấy từ CSS variables (xem src/index.css) để Dark/Light mode
// chuyển mượt mà mà không cần viết `dark:` ở từng component.
const withVar = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: [
          '"Plus Jakarta Sans"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        bg: withVar('--c-bg'),
        surface: withVar('--c-surface'),
        'surface-2': withVar('--c-surface-2'),
        fg: withVar('--c-fg'),
        muted: withVar('--c-muted'),
        brand: {
          DEFAULT: withVar('--c-brand'),
          fg: withVar('--c-brand-fg'),
        },
        accent: withVar('--c-accent'),
      },
      borderColor: {
        DEFAULT: withVar('--c-border'),
      },
      boxShadow: {
        soft: '0 12px 32px -14px rgb(10 40 32 / 0.35)',
        card: '0 1px 2px rgb(10 40 32 / 0.06), 0 18px 40px -22px rgb(10 40 32 / 0.35)',
      },
      keyframes: {
        'fade-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-down': 'fade-down 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
