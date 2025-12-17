import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Ekran importları
import RouteMapScreen from './src/screens/route/RouteMapScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/chat/ChatScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import RouteScreen from './src/screens/route/RouteDetailScreen';
import RouteEditScreen from './src/screens/route/RouteEditScreen';
import LLMResultEditScreen from './src/screens/chat/LLMResultEditScreen';
import TransportSelectScreen from './src/screens/route/TransportSelectScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Alt tab navigator (sadece Anasayfa, Rota, Profil)
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Route" component={RouteScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Stack navigator (login/register ve diğer tüm ekranlar)
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Auth ekranları */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Alt tab ekranları */}
        <Stack.Screen name="MainTabs" component={MainTabs} />


        {/* Düzenleme ve LLM ekranları */}
        <Stack.Screen name="RouteEdit" component={RouteEditScreen} />
        <Stack.Screen name="LLMResultEdit" component={LLMResultEditScreen} />
        <Stack.Screen name="RouteMap" component={RouteMapScreen} />


        {/* Transport seçme ekranı */}
        <Stack.Screen name="TransportSelect" component={TransportSelectScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
