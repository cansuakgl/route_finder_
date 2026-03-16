import { AppButton } from '@/components/ui/app-button';
import { ErrorMessage } from '@/components/ui/error-message';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordStrengthIndicator } from '@/components/ui/password-strength-indicator';
import { useTheme } from '@/context/theme-context';
import { supabase } from '@/lib/supabase';
import { validatePassword } from '@/lib/validation';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const { colors } = theme;

  const handleUpdatePassword = async () => {
    setError(null);

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) throw error;
      
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: theme.spacing.lg }}>
        <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center' }}>
          <Text 
            variant="headlineMedium" 
            style={{ textAlign: 'center', marginBottom: 16, color: colors.text }}
          >
            Password Updated!
          </Text>
          <Text 
            variant="bodyMedium" 
            style={{ textAlign: 'center', marginBottom: 24, color: colors.textSecondary }}
          >
            Your password has been successfully updated. You can now sign in with your new password.
          </Text>
          <AppButton
            title="Continue to App"
            onPress={() => router.replace('/(tabs)')}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: theme.spacing.lg }}>
      <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center' }}>
        <Text 
          variant="headlineMedium" 
          style={{ textAlign: 'center', marginBottom: 8, color: colors.text }}
        >
          Reset Password
        </Text>
        <Text 
          variant="bodyMedium" 
          style={{ textAlign: 'center', marginBottom: 24, color: colors.textSecondary }}
        >
          Enter your new password below.
        </Text>

        <PasswordInput
          placeholder="New Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(null);
          }}
          containerStyle={{ marginBottom: theme.spacing.sm, width: '100%' }}
        />
        
        {password.length > 0 && (
          <PasswordStrengthIndicator password={password} />
        )}

        <PasswordInput
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setError(null);
          }}
          containerStyle={{ marginBottom: theme.spacing.sm, width: '100%' }}
        />

        <ErrorMessage message={error} />

        <View style={{ marginTop: theme.spacing.md, alignSelf: 'center' }}>
          <AppButton
            title={isLoading ? 'Updating...' : 'Update Password'}
            onPress={handleUpdatePassword}
            disabled={isLoading}
          />
        </View>
      </View>
    </View>
  );
}
