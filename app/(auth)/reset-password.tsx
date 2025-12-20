import { AppButton } from '@/components/ui/app-button';
import { ErrorMessage } from '@/components/ui/error-message';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordStrengthIndicator } from '@/components/ui/password-strength-indicator';
import { Colors, formStyles, layoutStyles } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { validatePassword } from '@/lib/validation';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, useColorScheme } from 'react-native';
import { Text } from 'react-native-paper';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

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
      <View style={layoutStyles.centeredContainer}>
        <View style={formStyles.formContainer}>
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
            onPress={() => router.replace('/')}
            mode="contained"
            buttonColor={colors.primary}
            textColor={colors.text}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={layoutStyles.centeredContainer}>
      <View style={formStyles.formContainer}>
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
          containerStyle={formStyles.inputSpacing}
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
          containerStyle={formStyles.inputSpacing}
        />

        <ErrorMessage message={error} />

        <View style={formStyles.buttonSpacing}>
          <AppButton
            title={isLoading ? 'Updating...' : 'Update Password'}
            onPress={handleUpdatePassword}
            disabled={isLoading}
            mode="contained"
            buttonColor={colors.primary}
            textColor={colors.text}
          />
        </View>
      </View>
    </View>
  );
}
