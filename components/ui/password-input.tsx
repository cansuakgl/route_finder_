import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { AppTextInput, type AppTextInputProps } from './app-text-input';

export type PasswordInputProps = Omit<AppTextInputProps, 'secureTextEntry'>;

export function PasswordInput({
  containerStyle,
  style,
  ...rest
}: PasswordInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[containerStyle, { position: 'relative' }]}>
      <AppTextInput
        {...rest}
        secureTextEntry={!isPasswordVisible}
        style={[{ paddingRight: 48 }, style]}
      />
      <Pressable
        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        style={{
          position: 'absolute',
          right: 12,
          top: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialCommunityIcons
          name={isPasswordVisible ? 'eye-off' : 'eye'}
          size={22}
          color={colors.icon}
        />
      </Pressable>
    </View>
  );
}
