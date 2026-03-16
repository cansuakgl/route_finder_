import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const theme = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  // # NON-DRY component — root <View> should use <ThemedView> from components/themed-view
  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: theme.spacing.lg, backgroundColor: theme.colors.surface }}>
      {/* Profile Card */}
      <View style={{ paddingVertical: theme.spacing.xl, alignItems: 'center', elevation: 4, marginBottom: theme.spacing.xl, backgroundColor: theme.colors.surfaceElevated, borderRadius: theme.radius.lg }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surface }}>
          <ThemedText variant="heading2">
            {(user?.email?.[0] || 'U').toUpperCase()}
          </ThemedText>
        </View>

        <ThemedText variant="heading3" style={{ marginTop: theme.spacing.md }}>
          {user?.email?.split('@')[0] || 'User'}
        </ThemedText>
        <ThemedText variant="muted" style={{ marginTop: theme.spacing.xs }}>
          {user?.email || 'user@example.com'}
        </ThemedText>
      </View>

      <AppButton
        variant="danger"
        title="Çıkış Yap"
        onPress={handleLogout}
      />
    </View>
  );
}
