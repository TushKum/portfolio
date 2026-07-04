// One canonical color list feeding both the DOM (tailwind.config.ts mirrors
// these) and three.js (new Color(hex)). Keep the two in sync by hand.
export const colors = {
  blue: '#0A1FE0',
  cyan: '#00E5FF',
  violet: '#FF00E5',
  lime: '#00F52A',
  yellow: '#FFE800',
  orange: '#FFB300',
  red: '#E8291C',
  coffee: '#5A2400',
  coffeeLight: '#8A3A08',
  white: '#ffffff',
  black: '#000000',
  screenOff: '#000A66',
};

// Cycling (bg, text) pairs — the strobe that feeds hover states and the
// project title previews.
export const palettePairs = [
  { bg: colors.blue, text: colors.white },
  { bg: colors.yellow, text: colors.black },
  { bg: colors.cyan, text: colors.black },
  { bg: colors.violet, text: colors.white },
  { bg: colors.lime, text: colors.black },
];
