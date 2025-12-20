import { View, Text, useColorScheme } from 'react-native';
import { validatePassword, PasswordValidation } from '@/lib/validation';
import { Colors, formStyles } from '@/constants/theme';

type PasswordStrengthIndicatorProps = {
  password: string;
  showRequirements?: boolean;
};

export function PasswordStrengthIndicator({ 
  password, 
  showRequirements = true 
}: PasswordStrengthIndicatorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const validation = validatePassword(password);

  if (!password || !showRequirements) return null;

  const requirements = [
    { key: 'minLength', label: 'At least 6 characters', met: validation.minLength },
    { key: 'hasUpperCase', label: 'One uppercase letter', met: validation.hasUpperCase },
    { key: 'hasLowerCase', label: 'One lowercase letter', met: validation.hasLowerCase },
    { key: 'hasNumber', label: 'One number', met: validation.hasNumber },
    { key: 'hasSpecialChar', label: 'One special character', met: validation.hasSpecialChar },
  ];

  return (
    <View style={formStyles.helperText}>
      {requirements.map((req) => (
        <Text
          key={req.key}
          style={{
            fontSize: 12,
            color: req.met ? colors.success : colors.textSecondary,
            marginBottom: 2,
          }}
        >
          {req.met ? '✓' : '○'} {req.label}
        </Text>
      ))}
    </View>
  );
}
