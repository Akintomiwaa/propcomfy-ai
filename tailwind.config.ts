import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        grotesk: ['Space Grotesk', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        bg: '#0a0a0a',
        panel: '#0e0e0f',
        panel2: '#111113',
        border: '#1a1a1d',
        fg: '#f3f4f6',
        fgd: '#d4d7dd',
        muted: '#a0a4ad',
        gold: '#d6b14d',
        gold2: '#b99328',
      },
    },
  },
  plugins: [],
} satisfies Config;

