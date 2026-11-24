/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light & Shared Palette
        forest: {
          DEFAULT: '#183B3A',
          primary: '#183B3A',
          secondary: '#245451',
          hover: '#2D6662',
          dark: '#142522',
        },
        emerald: {
          50: '#F0FDF4',
          100: '#DDF3EC',
          200: '#BAE6D8',
          300: '#7CD0B8',
          400: '#34B794',
          500: '#16845B',
          600: '#0F766E',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
        },
        warm: {
          bg: '#F4F2EB',
          surface: '#FFFFFF',
          muted: '#F8F7F2',
          border: '#E4E5DC',
        },
        graphite: {
          DEFAULT: '#27332F',
          primary: '#27332F',
          secondary: '#718078',
          muted: '#8A9890',
        },
        gold: {
          DEFAULT: '#D9A441',
          muted: '#D9A441',
          light: '#F8ECCF',
          dark: '#B08029',
        },
        // Dark Mode Color System Tokens
        dark: {
          bg: '#172A27',         // Background utama
          sidebar: '#142522',    // Sidebar
          surface: '#1D332E',    // Card dan panel
          elevated: '#223B35',   // Container bertingkat
          hover: '#2B4840',      // Hover state
          selected: '#31584C',   // Active navigation
          border: '#355047',     // Border
          text: '#F1F5F2',       // Primary text
          secondary: '#B8CCC3',  // Secondary text
          muted: '#829A8F',      // Muted text
          accent: '#8DD6BB',     // Accent / Light mint
          primary: '#0F766E',    // Primary action
          gold: '#D9A441',       // Highlight
        },
        enterprise: {
          forest: '#183B3A',
          'forest-secondary': '#245451',
          emerald: '#0F766E',
          'emerald-light': '#DDF3EC',
          bg: '#F4F2EB',
          surface: '#FFFFFF',
          'surface-muted': '#F8F7F2',
          graphite: '#27332F',
          'text-secondary': '#718078',
          border: '#E4E5DC',
          gold: '#D9A441',
          success: '#16845B',
          warning: '#C58B32',
          danger: '#C94B4B',
          info: '#527DA8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
