import { Text, type TextProps } from 'react-native';

import { useTheme, type TextVariant } from '@/context/theme-context';

export type ThemedTextProps = TextProps & {
  variant?: TextVariant;
};

export function ThemedText({ variant = 'body', style, ...rest }: ThemedTextProps) {
  const { variants } = useTheme();
  return <Text style={[variants.text[variant], style]} {...rest} />;
}
