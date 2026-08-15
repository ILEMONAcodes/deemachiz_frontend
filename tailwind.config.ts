import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Scans app, components, context, lib, etc.
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Primary Action Blue
          600: '#2563eb', // Deep Royal Blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a', // Dark Navy Blue
          950: '#172554',
        },
      },
    },
  },
  plugins: [],
};

export default config;