import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';

const Stack = createStackNavigator();

// Hook to track orientation changes
function useOrientation() {
  const [orientation, setOrientation] = useState(
    Dimensions.get('window').width > Dimensions.get('window').height ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setOrientation(window.width > window.height ? 'landscape' : 'portrait');
    });
    
    return () => subscription?.remove();
  }, []);

  return orientation;
}

// Library Screen Component - Simple horizontal layout
function LibraryScreen({ navigation }) {
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonHeader}>
          <Text style={styles.backButtonHeaderText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.titleLarge}>📚 Formation Library</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={isLandscape ? styles.horizontalContent : styles.verticalContent}>
        <View style={isLandscape ? styles.leftPanel : styles.fullPanel}>
          <Text style={styles.sectionTitleLarge}>🏈 Offensive Formations</Text>
          <Text style={styles.placeholderText}>
            Complete formation library coming soon! Will include all formations, plays, strengths, weaknesses, and situational usage.
          </Text>
        </View>
        
        <View style={isLandscape ? styles.rightPanel : styles.fullPanel}>
          <Text style={styles.sectionTitleLarge}>🛡️ Defensive Formations</Text>
          <Text style={styles.placeholderText}>
            Defensive formation library will show coverage packages, blitz schemes, and how to attack each defensive look.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Placeholder Settings Screen - will be created next
function SettingsScreen({ navigation }) {
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonHeader}>
          <Text style={styles.backButtonHeaderText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.titleLarge}>⚙️ Difficulty Settings</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={isLandscape ? styles.horizontalContent : styles.verticalContent}>
        <View style={isLandscape ? styles.leftPanel : styles.fullPanel}>
          <Text style={styles.sectionTitleLarge}>🎮 Difficulty Presets</Text>
          <Text style={styles.placeholderText}>
            • 👶 Rookie Mode - See most defensive information{'\n'}
            • 🧠 Pro Mode - Realistic pre-snap reads only{'\n'}
            • 🔥 Elite Mode - Visual only, minimal information{'\n'}
            • 🎮 Custom Mode - Choose exactly what you can see
          </Text>
        </View>
        
        <View style={isLandscape ? styles.rightPanel : styles.fullPanel}>
          <Text style={styles.sectionTitleLarge}>👁️ Visibility Controls</Text>
          <Text style={styles.placeholderText}>
            Settings screen coming next! This will include:{'\n'}
            • Formation visibility controls{'\n'}
            • Coverage information settings{'\n'}
            • Blitz package visibility{'\n'}
            • Game mode selection (Learner vs Pro)
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Main App Component with Navigation
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Library" component={LibraryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Simplified styles - just what's needed for remaining screens
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Header Bar
  headerBar: {
    backgroundColor: '#1f4e79',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  titleLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  backButtonHeader: {
    padding: 8,
  },
  backButtonHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    width: 100,
  },

  // Layout
  horizontalContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
    gap: 20,
  },
  verticalContent: {
    flex: 1,
    padding: 20,
  },
  leftPanel: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullPanel: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Typography
  sectionTitleLarge: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
});