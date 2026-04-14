/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#020617',
        foreground: '#f8fafc',
        card: {
          DEFAULT: '#0f172a',
          foreground: '#f8fafc',
        },
        primary: {
          DEFAULT: '#6366f1',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#1e293b',
          foreground: '#94a3b8',
        },
        accent: {
          DEFAULT: '#1e293b',
          foreground: '#f8fafc',
        },
        border: '#1e293b',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
