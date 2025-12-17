// AppNavigator.js
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatScreen from '../screens/chat/ChatScreen'; 
import TransportSelectScreen from '../screens/route/TransportSelectScreen';
import RouteDetailScreen from '../screens/route/RouteDetailScreen';
//import RouteEditScreen from '../screens/route/RouteEditScreen';
import RouteMapScreen from '../screens/route/RouteMapScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Chat" component={ChatScreen} />

      <Stack.Screen name="RouteDetail" component={RouteDetailScreen} />
      <Stack.Screen name="RouteMap" component={RouteMapScreen} />

      <Stack.Screen name="TransportSelect" component={TransportSelectScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
