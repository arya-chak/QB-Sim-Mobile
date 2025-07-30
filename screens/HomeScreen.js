import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import ApiService from '../ApiService';

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

export default function HomeScreen({ navigation }) {
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const apiStats = await ApiService.getStats();
      setStats(apiStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Compact Header Bar */}
      <View style={styles.headerBar}>
        <Text style={styles.titleLarge}>🏈 QB Pre-Snap Simulator</Text>
        <Text style={styles.subtitleLarge}>
          {isLandscape ? 'Landscape Mode' : 'Portrait Mode'}
        </Text>
      </View>

      {/* Responsive Content Layout with ScrollView */}
      <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.scrollContentContainer}>
        <View style={isLandscape ? styles.horizontalContent : styles.verticalContent}>
          
          {/* Left Panel - Quote & Description */}
          <View style={isLandscape ? styles.leftPanel : styles.fullPanel}>
            <Text style={styles.quoteTextLarge}>
              "I didn't snap the ball unless I knew what they were doing..."
            </Text>
            <Text style={styles.quoteAuthor}>— Tom Brady</Text>
            
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionTitle}>🎯 How to Play:</Text>
              <Text style={styles.descriptionText}>
                • Read the defensive formation{'\n'}
                • Identify coverage and personnel{'\n'}
                • Select the right play to attack{'\n'}
                • Learn from your decisions
              </Text>
            </View>

            {stats && (
              <View style={styles.statsBox}>
                <Text style={styles.statsTitle}>📊 Available Data:</Text>
                <Text style={styles.statsText}>
                  • {stats.defensive_formations} Defensive Formations{'\n'}
                  • {stats.offensive_formations} Offensive Formations{'\n'}
                  • {stats.total_defensive_scenarios} Total Scenarios{'\n'}
                  • {stats.total_offensive_plays} Offensive Plays
                </Text>
              </View>
            )}
          </View>

          {/* Right Panel - Action Buttons */}
          <View style={isLandscape ? styles.rightPanel : styles.fullPanel}>
            <TouchableOpacity 
              style={styles.primaryButtonLarge}
              onPress={() => navigation.navigate('Game')}
            >
              <Text style={styles.primaryButtonTextLarge}>🎯 Start New Scenario</Text>
              <Text style={styles.buttonSubtext}>Test your QB decision making</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButtonLarge}
              onPress={() => navigation.navigate('Library')}
            >
              <Text style={styles.secondaryButtonTextLarge}>📚 Formation Library</Text>
              <Text style={styles.buttonSubtext}>Study all formations and plays</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.tertiaryButtonLarge}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.tertiaryButtonTextLarge}>⚙️ Difficulty Settings</Text>
              <Text style={styles.buttonSubtext}>Customize what you can see</Text>
            </TouchableOpacity>

            {isLandscape && (
              <View style={styles.landscapeIndicator}>
                <Text style={styles.landscapeText}>
                  🏈 Perfect! This landscape view is optimized for tablet use.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Header Bar - Compact for tablets
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
  subtitleLarge: {
    fontSize: 14,
    color: '#e0e7ff',
  },

  // Horizontal Content Layout
  horizontalContent: {
    flexDirection: 'row',
    gap: 20,
    minHeight: '100%',
  },
  // Vertical Content Layout
  verticalContent: {
    minHeight: '100%',
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
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
  // Full panel for portrait mode
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

  // Typography - Larger for tablets
  quoteTextLarge: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#6b7280',
    lineHeight: 26,
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 24,
    textAlign: 'right',
  },

  // Description and Info Boxes
  descriptionBox: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: '#0c4a6e',
    lineHeight: 22,
  },
  statsBox: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    padding: 16,
    borderRadius: 8,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 15,
    color: '#065f46',
    lineHeight: 22,
  },

  // Large Buttons for Tablets
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
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  secondaryButtonLarge: {
    backgroundColor: '#6366f1',
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
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
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
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Landscape indicator
  landscapeIndicator: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  landscapeText: {
    fontSize: 14,
    color: '#0369a1',
    textAlign: 'center',
    fontWeight: '600',
  },
});