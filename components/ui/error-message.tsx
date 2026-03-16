import { useTheme } from '@/context/theme-context';
import { Text } from 'react-native';

type ErrorMessageProps = {
  message: string | null;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  const { variants, spacing } = useTheme();

  if (!message) return null;

  return (
    <Text style={[variants.text.error, { marginVertical: spacing.xs }]}>
      {message}
    </Text>
  );
}
