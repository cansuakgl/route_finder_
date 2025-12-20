import { View, Text, useColorScheme } from 'react-native';
import { Colors, formStyles } from '@/constants/theme';

export function FormDivider({ text = 'or' }: { text?: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={formStyles.dividerContainer}>
      <View style={[formStyles.dividerLine, { backgroundColor: colors.border }]} />
      <Text style={[formStyles.dividerText, { color: colors.textSecondary }]}>
        {text}
      </Text>
      <View style={[formStyles.dividerLine, { backgroundColor: colors.border }]} />
    </View>
  );
}
