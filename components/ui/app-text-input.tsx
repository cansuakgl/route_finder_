import type { StyleProp, ViewStyle } from 'react-native';
import { TextInput, View, type TextInputProps } from 'react-native';

import { useTheme, type InputVariant } from '@/context/theme-context';

export type AppTextInputProps = TextInputProps & {
  variant?: InputVariant;
  /** Wraps the TextInput in a View — use this for margins/width layout */
  containerStyle?: StyleProp<ViewStyle>;
};

export function AppTextInput({
  variant = 'default',
  containerStyle,
  style,
  placeholderTextColor,
  ...rest
}: AppTextInputProps) {
  const { variants } = useTheme();
  const v = variants.input[variant];

  return (
    <View style={containerStyle}>
      <TextInput
        {...rest}
        placeholderTextColor={placeholderTextColor ?? v.placeholderColor}
        style={[v.style, style]}
      />
    </View>
  );
}
