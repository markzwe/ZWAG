// theme.ts

const COLORS = {
  black: '#000000',
  darkGray: '#222222',
  mediumGray: '#666666',
  lightGray: '#E0E0E0',
  offWhite: '#FAFAFA',       // main UI background (lightest)
  surface: '#F0F0F0',        // clothing image background (slightly darker)
  pureWhite: '#FFFFFF',      // cards, containers
  warmGrayAccent: '#F5F5F5',
  divider: '#D6D6D6',
  border: '#E0E0E0',
  accent: '#00391e',

  //Testing colors
  red: '#540000ff',
  blue: '#0059b2ff',
  green: '#005904ff',

  error: '#B00020',
  success: '#2E7D32',
  warning: '#FFAB00',

  primaryBackground: '#FAFAFA',
  imageBackground: '#F0F0F0',  // darker than primaryBackground for clothes images
  buttonBackground: '#222222',
  buttonText: '#FFFFFF',

  textPrimary: '#111111',
  textSecondary: '#666666',
  textDisabled: '#999999',

  overlay: 'rgba(0,0,0,0.4)',
};

const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  // Replace with your custom fonts if you have them, e.g. 'Inter-Regular'
};

const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
};

const SPACING = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 28,
  xl: 36,
};

const BORDER_RADIUS = {
  sm: 3,
  md: 6,
  lg: 9,
  apple: 38, // Apple-style rounded corners
};

const SHADOWS = {
  sm: {
    shadowColor: '#00000020',  // 12% opacity black
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#00000030',  // 18% opacity black
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#00000040',  // 25% opacity black
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
};

export { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS };
