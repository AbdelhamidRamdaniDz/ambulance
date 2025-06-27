import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

const tintColorLight = '#007AFF';
const tintColorDark = '#64B5F6';

export const COLORS = {
  roles: {
    paramedic: '#007AFF',
    paramedicLight: '#E3F2FD',
    hospital: '#4CAF50',
    hospitalLight: '#E8F5E8',
  },
  
  status: {
    available: '#4CAF50',
    availableLight: '#E8F5E8',
    limited: '#FF9800',
    limitedLight: '#FFF3E0',
    unavailable: '#F44336',
    unavailableLight: '#FFEBEE',
  },
  
  accent: {
    primary: '#2196F3',
    secondary: '#9C27B0',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#00BCD4',
  },
  
  light: {
    text: '#212121',
    textSecondary: '#757575',
    textTertiary: '#9E9E9E',
    background: '#FAFAFA',
    backgroundSecondary: '#F5F5F5',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#BDBDBD',
    tabIconSelected: tintColorLight,
    border: '#E0E0E0',
    borderLight: '#F0F0F0',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
    ripple: 'rgba(0, 122, 255, 0.12)',
  },
  
  dark: {
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    card: '#1E1E1E',
    cardElevated: '#2C2C2C',
    tint: tintColorDark,
    tabIconDefault: '#666666',
    tabIconSelected: tintColorDark,
    border: '#333333',
    borderLight: '#2A2A2A',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
    ripple: 'rgba(100, 181, 246, 0.12)',
  },
};

export const SIZES = {
  base: 8,
  small: 12,
  medium: 16,
  large: 24,
  xlarge: 32,
  
  padding: 16,
  paddingSmall: 8,
  paddingMedium: 16,
  paddingLarge: 24,
  paddingHorizontal: 20,
  paddingVertical: 16,
  margin: 16,
  
  radius: 12,
  radiusSmall: 8,
  radiusLarge: 16,
  radiusXLarge: 24,
  
  font: 14,
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  title: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  
  icon: {
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 32,
  },
  
  avatar: {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 80,
  },
  
  // Screen Dimensions
  width,
  height,
  
  // Layout helpers
  headerHeight: 56,
  tabBarHeight: 60,
  statusBarHeight: 24,
};

// تحسين الخطوط
export const FONTS = {
  // Font sizes
  sizes: {
    tiny: 10,
    small: 12,
    medium: 14,
    large: 18,
    xlarge: 24,
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 20,
    title: 18,
    body: 16,
    bodySmall: 14,
    caption: 12,
  },

  // Font families
  families: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
  },

  // Font weights
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },

  // Predefined font styles
  h1: { 
    fontFamily: 'System', 
    fontSize: SIZES.h1, 
    lineHeight: SIZES.h1 * 1.2, 
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h2: { 
    fontFamily: 'System', 
    fontSize: SIZES.h2, 
    lineHeight: SIZES.h2 * 1.2, 
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h3: { 
    fontFamily: 'System', 
    fontSize: SIZES.h3, 
    lineHeight: SIZES.h3 * 1.3, 
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  h4: { 
    fontFamily: 'System', 
    fontSize: SIZES.h4, 
    lineHeight: SIZES.h4 * 1.3, 
    fontWeight: '600',
  },
  title: { 
    fontFamily: 'System', 
    fontSize: SIZES.title, 
    lineHeight: SIZES.title * 1.3, 
    fontWeight: '600',
  },
  body: { 
    fontFamily: 'System', 
    fontSize: SIZES.body, 
    lineHeight: SIZES.body * 1.4, 
    fontWeight: '400',
  },
  bodySmall: { 
    fontFamily: 'System', 
    fontSize: SIZES.bodySmall, 
    lineHeight: SIZES.bodySmall * 1.4, 
    fontWeight: '400',
  },
  caption: { 
    fontFamily: 'System', 
    fontSize: SIZES.caption, 
    lineHeight: SIZES.caption * 1.3, 
    fontWeight: '400',
  },
  button: { 
    fontFamily: 'System', 
    fontSize: SIZES.body, 
    lineHeight: SIZES.body * 1.2, 
    fontWeight: '600',
  },
} as const;

export const SHADOWS = {
  light: {
    small: {
      shadowColor: COLORS.light.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: COLORS.light.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: COLORS.light.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  dark: {
    small: {
      shadowColor: COLORS.dark.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: COLORS.dark.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: COLORS.dark.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export const ANIMATIONS = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

const appTheme = { COLORS, SIZES, FONTS, SHADOWS, ANIMATIONS };

export default appTheme;