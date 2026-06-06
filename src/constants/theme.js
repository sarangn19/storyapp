export const colors = {
  bg: '#120B24',
  surface: '#2A1848',
  surfaceLight: '#4A3A75',
  primary: '#FF8A00',
  primaryGlow: 'rgba(255,138,0,0.35)',
  primaryLight: '#FFC54D',
  accent: '#4DD0E1',
  text: '#F5E6D3',
  textDim: '#B8A9C9',
  textMuted: '#7A6A8A',
  success: '#7BC67E',
  danger: '#FF7043',
  overlay: 'rgba(18,11,36,0.85)',
  white: '#FFFFFF',

  emotion: {
    great: '#FFD54F',
    okay: '#4DD0E1',
    anxious: '#9575CD',
    low: '#7986CB',
    drained: '#FF7043',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const typography = {
  fontFamily: 'Sora',
  title: 28,
  subtitle: 20,
  body: 16,
  caption: 14,
  small: 12,
};

export const borderRadius = {
  sm: 12,
  md: 20,
  lg: 28,
  xl: 32,
  full: 999,
};

export const shadows = {
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
    elevation: 12,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 8,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};
