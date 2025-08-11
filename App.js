import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
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
          <Text style={styles.descriptionText}>
            Explore all offensive formations with detailed play breakdowns, routes, and tactical analysis.
          </Text>
          
          <TouchableOpacity 
            style={styles.libraryButton}
            onPress={() => navigation.navigate('OffensiveLibrary')}
          >
            <View style={styles.libraryButtonContent}>
              <Text style={styles.libraryButtonEmoji}>🏈</Text>
              <View style={styles.libraryButtonText}>
                <Text style={styles.libraryButtonTitle}>Browse Offensive Formations</Text>
                <Text style={styles.libraryButtonSubtitle}>7 formations • 70 plays</Text>
              </View>
              <Text style={styles.libraryButtonArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={isLandscape ? styles.rightPanel : styles.fullPanel}>
          <Text style={styles.sectionTitleLarge}>🛡️ Defensive Formations</Text>
          <Text style={styles.descriptionText}>
            Browse defensive formations, coverage packages, and blitz schemes.
          </Text>
          
          <TouchableOpacity 
            style={styles.libraryButton}
            onPress={() => navigation.navigate('DefensiveLibrary')}
          >
            <View style={styles.libraryButtonContent}>
              <Text style={styles.libraryButtonEmoji}>🛡️</Text>
              <View style={styles.libraryButtonText}>
                <Text style={styles.libraryButtonTitle}>Browse Defensive Formations</Text>
                <Text style={styles.libraryButtonSubtitle}>7 formations • 252 schemes</Text>
              </View>
              <Text style={styles.libraryButtonArrow}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.libraryButton}
            onPress={() => navigation.navigate('FormationComparison')}
          >
            <View style={styles.libraryButtonContent}>
              <Text style={styles.libraryButtonEmoji}>⚖️</Text>
              <View style={styles.libraryButtonText}>
                <Text style={styles.libraryButtonTitle}>Formation Comparison</Text>
                <Text style={styles.libraryButtonSubtitle}>Analyze matchups & strategies</Text>
              </View>
              <Text style={styles.libraryButtonArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.libraryFooter}>
        <Text style={styles.libraryFooterText}>
          Study formations and plays to improve your pre-snap reads and decision making
        </Text>
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
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 20,
  },

  // Library Buttons
  libraryButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  libraryButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  libraryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  libraryButtonEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  libraryButtonText: {
    flex: 1,
  },
  libraryButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f4e79',
  },
  libraryButtonSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  libraryButtonArrow: {
    fontSize: 20,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#9ca3af',
  },

  // Footer
  libraryFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  libraryFooterText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});