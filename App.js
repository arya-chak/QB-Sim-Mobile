// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';

// Auth Screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';

// Existing Player Screens
import HomeScreen from './screens/HomeScreen';
// import GameScreen from './screens/GameScreen';
// import LibraryScreen from './screens/LibraryScreen';
// import SettingsScreen from './screens/SettingsScreen';
// import GapRecognitionScreen from './screens/GapRecognitionScreen';
// import SnapAudibleScreen from './screens/SnapAudibleScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          {/* Uncomment these as needed:
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Library" component={LibraryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="GapRecognition" component={GapRecognitionScreen} />
          <Stack.Screen name="SnapAudible" component={SnapAudibleScreen} />
          */}
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 16,
  },
});