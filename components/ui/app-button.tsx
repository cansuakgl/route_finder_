import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import { useTheme, type ButtonVariant } from '@/context/theme-context';

export type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Shows a spinner and disables the button while true */
  loading?: boolean;
  /** Escape hatch — overrides the outer Pressable style */
  style?: StyleProp<ViewStyle>;
  /** Escape hatch — overrides the label Text style */
  textStyle?: StyleProp<TextStyle>;
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  textStyle,
}: AppButtonProps) {
  const { variants } = useTheme();
  const v = variants.button[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        v.container,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={(v.text as TextStyle).color as string} />
      ) : (
        <Text style={[v.text, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = {
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
};
