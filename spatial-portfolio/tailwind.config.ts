import type { Config } from 'tailwindcss';

// theme.colors is replaced wholesale (not extended) — the site's palette is
// the canonical list in src/lib/colors.ts, duplicated here by hand so the
// DOM can use utility classes while three.js uses new Color(hex).
export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      white: '#ffffff',
      black: '#000000',
      blue: '#0A1FE0',
      cyan: '#00E5FF',
      violet: '#FF00E5',
      lime: '#00F52A',
      yellow: '#FFE800',
      orange: '#FFB300',
      red: '#E8291C',
      coffee: '#5A2400',
    },
    extend: {
      fontFamily: {
        mono: ['"Roboto Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
