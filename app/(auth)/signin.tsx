import { AppButton } from '@/components/ui/app-button';
import { AppTextInput } from '@/components/ui/app-text-input';
import { ErrorMessage } from '@/components/ui/error-message';
import { FormDivider } from '@/components/ui/form-divider';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordStrengthIndicator } from '@/components/ui/password-strength-indicator';
import { Colors, formStyles, layoutStyles } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { validateEmail, validatePassword } from '@/lib/validation';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, View, useColorScheme } from 'react-native';
import { SegmentedButtons, Text } from 'react-native-paper';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleSubmit = async () => {
    setError(null);

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (mode === 'login') {

      if (!password) {
        setError('Please enter your password');
        return;
      }

      setIsLoading(true);
      try {
        await signIn(email, password);
      } catch (err: any) {
        setError(err.message || 'Login failed. Please check your credentials.');
      } finally {
        setIsLoading(false);
      }
    } else {
   
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
        await signUp(email, password);
      } catch (err: any) {
        setError(err.message || 'Signup failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={layoutStyles.centeredContainer}>
      <View style={formStyles.formContainer}>
        {/* Toggle between Login/Signup */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <SegmentedButtons
            value={mode}
            onValueChange={(value) => {
              setMode(value as 'login' | 'signup');
              setError(null);
            }}
            buttons={[
              { value: 'login', label: 'Login', style: { minWidth: 80 } },
              { value: 'signup', label: 'Sign Up', style: { minWidth: 100 } },
            ]}
            theme={{
              colors: {
                secondaryContainer: colors.secondary,
                onSecondaryContainer: colors.background,
              },
            }}
            density="regular"
          />
        </View>

        <AppTextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={formStyles.inputSpacing}
        />
        
        <PasswordInput
          placeholder="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(null);
          }}
          containerStyle={formStyles.inputSpacing}
        />
        
        {mode === 'login' && (
          <Link href="/(auth)/forgot-password" asChild>
            <Pressable style={{ alignSelf: 'flex-end', marginBottom: 8 }}>
              <Text style={{ color: colors.primary, fontSize: 14 }}>
                Forgot Password?
              </Text>
            </Pressable>
          </Link>
        )}

        {mode === 'signup' && password.length > 0 && (
          <PasswordStrengthIndicator password={password} />
        )}
    
        {mode === 'signup' && (
          <PasswordInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setError(null);
            }}
            containerStyle={formStyles.inputSpacing}
          />
        )}

       
        <ErrorMessage message={error} />
      
        <View style={formStyles.buttonSpacing}>
          <AppButton
            title={isLoading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Sign Up')}
            onPress={handleSubmit}
            disabled={isLoading}
            mode="contained"
            buttonColor={colors.primary}
            textColor={colors.text}
          />
        </View>
        <FormDivider />
        <AppButton
          title={mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          mode="outlined"
          buttonColor="transparent"
          textColor={colors.text}
          icon="google"
          containerStyle={formStyles.buttonSelfSize}
        />
      </View>
    </View>
  );
}

