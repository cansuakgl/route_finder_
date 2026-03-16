import { useTheme } from '@/context/theme-context';
import { Text, View } from 'react-native';

export function FormDivider({ text = 'or' }: { text?: string }) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg }}>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      <Text style={{ color: colors.textSecondary, marginHorizontal: spacing.md, fontSize: typography.sizes.sm }}>
        {text}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    </View>
  );
}
