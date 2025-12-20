import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { TextInput, type TextInputProps, View } from 'react-native';

import { Colors, inputShapeStyles, inputTextStyles } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type InputSize = keyof typeof inputShapeStyles;

export type AppTextInputProps = TextInputProps & {
  size?: InputSize;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function AppTextInput({
  size = 'm',
  containerStyle,
  inputStyle,
  style,
  placeholderTextColor,
  ...rest
}: AppTextInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={containerStyle}>
      <TextInput
        {...rest}
        placeholderTextColor={placeholderTextColor ?? colors.icon}
        style={[
          inputShapeStyles[size],
          inputTextStyles[size],
          {
            color: colors.text,
            borderColor: colors.icon,
            backgroundColor: colors.background,
          },
          style,
          inputStyle,
        ]}
      />
    </View>
  );
}
