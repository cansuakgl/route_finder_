import { Text, useColorScheme } from 'react-native';
import { Colors, formStyles } from '@/constants/theme';

type ErrorMessageProps = {
  message: string | null;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (!message) return null;

  return (
    <Text style={[formStyles.errorText, { color: colors.error }]}>
      {message}
    </Text>
  );
}
