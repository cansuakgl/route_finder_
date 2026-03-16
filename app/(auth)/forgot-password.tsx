import { AppButton } from '@/components/ui/app-button';
import { AppTextInput } from '@/components/ui/app-text-input';
import { ErrorMessage } from '@/components/ui/error-message';
import { useTheme } from '@/context/theme-context';
import { supabase } from '@/lib/supabase';
import { validateEmail } from '@/lib/validation';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const { colors } = theme;

  const handleResetPassword = async () => {
    setError(null);

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'routepicker://reset-password',
      });
      
      if (error) throw error;
      
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: theme.spacing.lg }}>
        <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center' }}>
          <Text 
            variant="headlineMedium" 
            style={{ textAlign: 'center', marginBottom: 16, color: colors.text }}
          >
            Check Your Email
          </Text>
          <Text 
            variant="bodyMedium" 
            style={{ textAlign: 'center', marginBottom: 24, color: colors.textSecondary }}
          >
            We've sent a password reset link to {email}. Click the link in the email to reset your password.
          </Text>
          <AppButton
            title="Back to Sign In"
            onPress={() => router.replace('/(auth)/signin')}
          />
          <Pressable 
            onPress={() => {
              setEmailSent(false);
              setEmail('');
            }}
            style={{ marginTop: 16, alignSelf: 'center' }}
          >
            <Text style={{ color: colors.primary }}>
              Didn't receive the email? Try again
            </Text>
          </Pressable>
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
          Forgot Password
        </Text>
        <Text 
          variant="bodyMedium" 
          style={{ textAlign: 'center', marginBottom: 24, color: colors.textSecondary }}
        >
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        <AppTextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={{ marginBottom: theme.spacing.sm, width: '100%' }}
        />

        <ErrorMessage message={error} />

        <View style={{ marginTop: theme.spacing.md, alignSelf: 'center' }}>
          <AppButton
            title={isLoading ? 'Sending...' : 'Send Reset Link'}
            onPress={handleResetPassword}
            disabled={isLoading}
          />
        </View>

        <Link href="/(auth)/signin" asChild>
          <Pressable style={{ marginTop: 16, alignSelf: 'center' }}>
            <Text style={{ color: colors.primary }}>
              Back to Sign In
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
