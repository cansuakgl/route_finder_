import { Platform, StyleSheet } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    primary: '#a8f0ee',
    secondary: '#90323D',
    accent: "#D7C9AA",
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    error: '#d32f2f',
    success: '#388e3c',
    warning: '#f57c00',
    textSecondary: '#757575',
    border: '#e0e0e0',
  },
  dark: {
    primary: '#3881bc',
    secondary: '#5E0B15',
    accent:  '#D7AF70',
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    error: '#ef5350',
    success: '#66bb6a',
    warning: '#ffa726',
    textSecondary: '#b0b0b0',
    border: '#424242',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const styles = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },

  radius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
  },
} as const;

export const buttonShapeStyles = StyleSheet.create({
  s: {
    minHeight: 32,
    paddingVertical: styles.spacing.xs,
    paddingHorizontal: styles.spacing.sm,
    borderRadius: styles.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  m: {
    minHeight: 40,
    paddingVertical: styles.spacing.sm,
    paddingHorizontal: styles.spacing.md,
    borderRadius: styles.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  l: {
    minHeight: 48,
    paddingVertical: styles.spacing.sm,
    paddingHorizontal: styles.spacing.lg,
    borderRadius: styles.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const textPresets = StyleSheet.create({
  s: {
    fontSize: styles.fontSize.sm,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  m: {
    fontSize: styles.fontSize.md,
    lineHeight: 22,
    fontFamily: Fonts.sans,
  },
  l: {
    fontSize: styles.fontSize.lg,
    lineHeight: 26,
    fontFamily: Fonts.sans,
  },
});

export const buttonTextStyles = textPresets;

export const inputShapeStyles = StyleSheet.create({
  s: {
    minHeight: 36,
    paddingVertical: styles.spacing.xs,
    paddingHorizontal: styles.spacing.sm,
    borderRadius: styles.radius.sm,
    borderWidth: 1,
  },
  m: {
    minHeight: 44,
    paddingVertical: styles.spacing.sm,
    paddingHorizontal: styles.spacing.md,
    borderRadius: styles.radius.md,
    borderWidth: 1,
  },
  l: {
    minHeight: 52,
    paddingVertical: styles.spacing.sm,
    paddingHorizontal: styles.spacing.lg,
    borderRadius: styles.radius.lg,
    borderWidth: 1,
  },
});

export const inputTextStyles = textPresets;


export const layoutStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    padding: styles.spacing.lg,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: styles.spacing.lg,
  },
});


export const formStyles = StyleSheet.create({
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputSpacing: {
    marginBottom: styles.spacing.sm,
    width: '100%',
  },
  sectionSpacing: {
    marginBottom: styles.spacing.lg,
  },
  errorText: {
    fontSize: styles.fontSize.sm,
    marginTop: styles.spacing.xs,
    marginBottom: styles.spacing.sm,
  },
  helperText: {
    fontSize: styles.fontSize.xs,
    marginTop: styles.spacing.xs,
    marginBottom: styles.spacing.sm,
  },
  buttonSpacing: {
    marginTop: styles.spacing.md,
    alignSelf: 'center',
  },
  buttonSelfSize: {
    alignSelf: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: styles.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: styles.spacing.md,
    fontSize: styles.fontSize.sm,
  },
  segmentedButtonContainer: {
    alignSelf: 'center',
    marginBottom: styles.spacing.lg,
    width: 'auto',
    minWidth: 0,
    flexShrink: 1,
    flexGrow: 0,
  },
});