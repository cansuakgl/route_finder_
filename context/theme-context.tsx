/**
 * useTheme — central hook that returns resolved design tokens + component
 * variant styles for the current color scheme.
 *
 * Usage:
 *   const theme = useTheme();
 *   <View style={{ backgroundColor: theme.colors.background }} />
 *   <AppButton variant="primary" />
 *   <ThemedText variant="heading1" />
 */

import type { TextStyle, ViewStyle } from 'react-native';

import { Colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ─── Variant type exports ─────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';

export type TextVariant =
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'caption'
  | 'muted'
  | 'error'
  | 'link';

export type InputVariant = 'default' | 'ghost';

// ─── Button variant shape ─────────────────────────────────────────────────────

export type ButtonVariantStyle = {
  container: ViewStyle;
  text: TextStyle;
};

// ─── Input variant shape ──────────────────────────────────────────────────────

export type InputVariantStyle = {
  style: TextStyle;
  placeholderColor: string;
};

// ─── useTheme hook ────────────────────────────────────────────────────────────

export function useTheme() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  // ── Button variants ───────────────────────────────────────────────────────

  const sharedButtonContainer: ViewStyle = {
    minHeight: 48,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const sharedButtonText: TextStyle = {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  };

  const buttonVariants: Record<ButtonVariant, ButtonVariantStyle> = {
    primary: {
      container: { ...sharedButtonContainer, backgroundColor: c.primary },
      text: { ...sharedButtonText, color: c.primaryContent },
    },
    secondary: {
      container: { ...sharedButtonContainer, backgroundColor: c.secondary },
      text: { ...sharedButtonText, color: c.secondaryContent },
    },
    ghost: {
      container: {
        ...sharedButtonContainer,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: c.primary,
      },
      text: { ...sharedButtonText, color: c.link },
    },
    danger: {
      container: { ...sharedButtonContainer, backgroundColor: c.error },
      text: { ...sharedButtonText, color: c.errorContent },
    },
    link: {
      container: {
        backgroundColor: 'transparent',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
      },
      text: {
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.regular,
        color: c.link,
        textDecorationLine: 'underline',
      },
    },
  };

  // ── Text variants ─────────────────────────────────────────────────────────

  const textVariants: Record<TextVariant, TextStyle> = {
    heading1: {
      fontSize: typography.sizes.xxl,
      fontWeight: typography.weights.bold,
      color: c.text,
      lineHeight: typography.sizes.xxl * 1.2,
    },
    heading2: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: c.text,
      lineHeight: typography.sizes.xl * 1.25,
    },
    heading3: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.semibold,
      color: c.text,
      lineHeight: typography.sizes.lg * 1.3,
    },
    body: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.regular,
      color: c.text,
      lineHeight: typography.sizes.md * 1.5,
    },
    bodySmall: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.regular,
      color: c.text,
      lineHeight: typography.sizes.sm * 1.5,
    },
    label: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: c.text,
    },
    caption: {
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.regular,
      color: c.textSecondary,
    },
    muted: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.regular,
      color: c.textSecondary,
    },
    error: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.regular,
      color: c.error,
    },
    link: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.regular,
      color: c.link,
      textDecorationLine: 'underline',
    },
  };

  // ── Input variants ────────────────────────────────────────────────────────

  const inputVariants: Record<InputVariant, InputVariantStyle> = {
    default: {
      style: {
        backgroundColor: c.surface,
        borderColor: c.border,
        borderWidth: 1,
        borderRadius: radius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        minHeight: 48,
        fontSize: typography.sizes.md,
        color: c.text,
      },
      placeholderColor: c.textSecondary,
    },
    ghost: {
      style: {
        backgroundColor: 'transparent',
        borderBottomColor: c.border,
        borderBottomWidth: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: 0,
        minHeight: 44,
        fontSize: typography.sizes.md,
        color: c.text,
      },
      placeholderColor: c.textSecondary,
    },
  };

  return {
    colors: c,
    spacing,
    radius,
    typography,
    shadows,
    scheme,
    variants: {
      button: buttonVariants,
      text: textVariants,
      input: inputVariants,
    },
  };
}

export type Theme = ReturnType<typeof useTheme>;
