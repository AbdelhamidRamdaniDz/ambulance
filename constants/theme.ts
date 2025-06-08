import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

const tintColorLight = '#007AFF';
const tintColorDark = '#ffffff';

export const COLORS = {
  roles: {
    paramedic: '#007AFF',
    hospital: '#28a745',
  },
  status: {
    available: '#30d158',
    limited: '#ff9f0a',
    unavailable: '#ff453a',
  },

  light: {
    text: '#1c1c1e',
    textSecondary: '#6e6e72',
    background: '#f0f2f5',
    card: '#ffffff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    border: '#e0e0e0',
  },
  dark: {
    text: '#ffffff',
    textSecondary: '#a0a0a5',
    background: '#000000',
    card: '#1c1c1e',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    border: '#3a3a3c',
  },
};

export const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
  h1: 30,
  h2: 22,
  h3: 16,
  title: 18,
  body: 14,
  caption: 12,
  width,
  height,
};

export const FONTS = {
  h1: { fontFamily: 'System', fontSize: SIZES.h1, lineHeight: 36, fontWeight: 'bold' },
  h2: { fontFamily: 'System', fontSize: SIZES.h2, lineHeight: 30, fontWeight: 'bold' },
  h3: { fontFamily: 'System', fontSize: SIZES.h3, lineHeight: 22, fontWeight: 'bold' },
  title: { fontFamily: 'System', fontSize: SIZES.title, lineHeight: 24, fontWeight: 'bold' },
  body: { fontFamily: 'System', fontSize: SIZES.body, lineHeight: 22 },
  caption: { fontFamily: 'System', fontSize: SIZES.caption, lineHeight: 18, fontWeight: '400' },
} as const;

const appTheme = { COLORS, SIZES, FONTS };

export default appTheme;