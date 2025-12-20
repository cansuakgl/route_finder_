import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Button, type ButtonProps } from 'react-native-paper';

import { buttonShapeStyles, buttonTextStyles } from '@/constants/theme';

type ButtonSize = keyof typeof buttonShapeStyles;

export type AppButtonProps = Omit<ButtonProps, 'children'> & {
  title: ReactNode;
  size?: ButtonSize;
  containerStyle?: StyleProp<ViewStyle>;
  shapeStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function AppButton({
  title,
  size = 'm',
  containerStyle,
  shapeStyle,
  textStyle,
  style,
  contentStyle,
  labelStyle,
  ...rest
}: AppButtonProps) {
  return (
    <Button
      {...rest}
      style={[style, containerStyle]}
      contentStyle={[buttonShapeStyles[size], contentStyle, shapeStyle]}
      labelStyle={[buttonTextStyles[size], labelStyle, textStyle]}
    >
      {title}
    </Button>
  );
}
