import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import SnapAudibleScreen from './screens/SnapAudibleScreen';
import GapRecognitionScreen from './screens/GapRecognitionScreen'; // NEW: Import Gap Recognition screen
import SettingsScreen from './screens/SettingsScreen';
import OffensiveLibraryScreen from './screens/OffensiveLibraryScreen';
import OffensiveFormationDetailScreen from './screens/OffensiveFormationDetailScreen';
import DefensiveLibraryScreen from './screens/DefensiveLibraryScreen';
import DefensiveFormationDetailScreen from './screens/DefensiveFormationDetailScreen';
import FormationComparisonScreen from './screens/FormationComparisonScreen';

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

// Library Screen Component - Simple horizontal layout (unchanged)
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
          <Text style={styles.descriptionText}>
            Explore all offensive formations with detailed play breakdowns, routes, and tactical analysis.
          </Text>
          
          <TouchableOpacity 
            style={styles.primaryButtonLarge}
            onPress={() => navigation.navigate('OffensiveLibrary')}
          >
            <Text style={styles.primaryButtonTextLarge}>📖 Browse Offensive Library</Text>
          </TouchableOpacity>
        </View>
        
        <View style={isLandscape ? styles.rightPanel : styles.fullPanel}>
          <Text style={styles.sectionTitleLarge}>🛡️ Defensive Formations</Text>
          <Text style={styles.descriptionText}>
            Study all defensive formations with coverage packages, blitz schemes, and tactical breakdowns.
          </Text>
          
          <TouchableOpacity 
            style={styles.secondaryButtonLarge}
            onPress={() => navigation.navigate('DefensiveLibrary')}
          >
            <Text style={styles.secondaryButtonTextLarge}>🔍 Browse Defensive Library</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.tertiaryButtonLarge}
            onPress={() => navigation.navigate('FormationComparison')}
          >
            <Text style={styles.tertiaryButtonTextLarge}>⚖️ Compare Formations</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Main App Component
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        
        {/* Snap or Audible screen */}
        <Stack.Screen 
          name="SnapAudible" 
          component={SnapAudibleScreen}
          options={{
            title: 'Snap or Audible',
            headerShown: false
          }}
        />
        
        {/* NEW: Gap Recognition screen */}
        <Stack.Screen 
          name="GapRecognition" 
          component={GapRecognitionScreen}
          options={{
            title: 'Gap Recognition',
            headerShown: false
          }}
        />
        
        <Stack.Screen name="Library" component={LibraryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen 
          name="OffensiveLibrary" 
          component={OffensiveLibraryScreen}
          options={{
            title: 'Offensive Library',
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="OffensiveFormationDetail" 
          component={OffensiveFormationDetailScreen}
          options={{
            title: 'Formation Details',
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="DefensiveLibrary" 
          component={DefensiveLibraryScreen}
          options={{
            title: 'Defensive Library',
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="DefensiveFormationDetail" 
          component={DefensiveFormationDetailScreen}
          options={{
            title: 'Defensive Formation Details',
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="FormationComparison" 
          component={FormationComparisonScreen}
          options={{
            title: 'Formation Comparison',
            headerShown: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Simplified styles - just what's needed for remaining screens (unchanged)
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
  descriptionText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 24,
  },

  // Buttons
  primaryButtonLarge: {
    backgroundColor: '#10b981',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonTextLarge: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButtonLarge: {
    backgroundColor: '#3b82f6',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonTextLarge: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tertiaryButtonLarge: {
    backgroundColor: '#f59e0b',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tertiaryButtonTextLarge: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default App;