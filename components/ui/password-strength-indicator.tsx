import { useTheme } from '@/context/theme-context';
import { validatePassword } from '@/lib/validation';
import { Text, View } from 'react-native';

type PasswordStrengthIndicatorProps = {
  password: string;
  showRequirements?: boolean;
};

export function PasswordStrengthIndicator({ 
  password, 
  showRequirements = true 
}: PasswordStrengthIndicatorProps) {
  const { colors } = useTheme();
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
    <View style={{ marginTop: 4, marginBottom: 8 }}>
      {requirements.map((req) => (
        <Text
          key={req.key}
          style={{ fontSize: 12, marginBottom: 2, color: req.met ? colors.success : colors.textSecondary }}
        >
          {req.met ? '✓' : '○'} {req.label}
        </Text>
      ))}
    </View>
  );
}
