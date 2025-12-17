// RootNavigator.js
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

export default function RootNavigator() {
  // 🚨 Test edebilmek için bu değeri TRUE yapıyoruz
  const isLoggedIn = true; // Şimdilik MOCK

  return (
    <NavigationContainer>
      {/* isLoggedIn TRUE olduğu için artık AppNavigator yüklenir */}
      {isLoggedIn ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}