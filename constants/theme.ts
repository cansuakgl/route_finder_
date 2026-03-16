import { Platform } from 'react-native';

// ─── Raw palette ────────────────────────────────────────────────────────────
const palette = {
  teal200: '#62d1cd',
  teal500: '#0a7ea4',
  teal700: '#3881bc',
  burgundy500: '#90323D',
  burgundy700: '#5E0B15',
  sand200: '#D7C9AA',
  sand400: '#D7AF70',
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  red400: '#ef5350',
  red600: '#d32f2f',
  green400: '#66bb6a',
  green600: '#388e3c',
  orange400: '#ffa726',
  orange600: '#f57c00',
  dark100: '#151718',
  dark200: '#1c1c1e',
  dark300: '#2c2c2e',
  dark400: '#3a3a3c',
} as const;

// ─── Semantic color tokens ────────────────────────────────────────────────────
export const Colors = {
  light: {
    primary: palette.teal200,
    primaryContent: palette.gray800,
    secondary: palette.burgundy500,
    secondaryContent: palette.white,
    accent: palette.sand200,
    background: palette.white,
    surface: palette.gray50,
    surfaceElevated: palette.white,
    text: palette.gray900,
    textSecondary: palette.gray500,
    textDisabled: palette.gray400,
    border: palette.gray200,
    icon: palette.gray500,
    error: palette.red600,
    errorContent: palette.white,
    success: palette.green600,
    successContent: palette.white,
    warning: palette.orange600,
    warningContent: palette.white,
    link: palette.teal500,
    tint: palette.teal500,
    tabIconDefault: palette.gray500,
    tabIconSelected: palette.teal500,
  },
  dark: {
    primary: palette.teal700,
    primaryContent: palette.white,
    secondary: palette.burgundy700,
    secondaryContent: palette.white,
    accent: palette.sand400,
    background: palette.dark100,
    surface: palette.dark200,
    surfaceElevated: palette.dark300,
    text: '#ECEDEE',
    textSecondary: palette.gray400,
    textDisabled: palette.gray600,
    border: palette.dark400,
    icon: palette.gray400,
    error: palette.red400,
    errorContent: palette.white,
    success: palette.green400,
    successContent: palette.white,
    warning: palette.orange400,
    warningContent: palette.white,
    link: palette.teal200,
    tint: palette.white,
    tabIconDefault: palette.gray400,
    tabIconSelected: palette.white,
  },
} as const;

// ─── Spacing scale ────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─── Border radius scale ──────────────────────────────────────────────────────
export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ─── Typography scale ─────────────────────────────────────────────────────────
export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  fonts: Platform.select({
    ios: { sans: 'system-ui', mono: 'ui-monospace' },
    default: { sans: 'normal', mono: 'monospace' },
  }),
} as const;

// ─── Elevation / shadow ───────────────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;