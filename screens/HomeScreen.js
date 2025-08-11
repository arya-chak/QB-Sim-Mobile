import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import ApiService from '../services/ApiService';

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
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Text style={styles.titleLarge}>🏈 QB Pre-Snap Simulator</Text>
        <Text style={styles.subtitleLarge}>
          Master Pre-Snap Reads Like a Pro
        </Text>
      </View>

      {/* Responsive Content Layout with ScrollView */}
      <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.scrollContentContainer}>
        <View style={isLandscape ? styles.horizontalContent : styles.verticalContent}>
          
          {/* Left Panel - Complete Tom Brady Quote & Description */}
          <View style={isLandscape ? styles.leftPanel : styles.fullPanel}>
            
            {/* Complete Tom Brady Quote */}
            <View style={styles.quoteContainer}>
              <Text style={styles.quoteTextLarge}>
                "I could figure out what they were doing before they did it because that's how I learned the game... Unfortunately, most quarterbacks aren't playing the game like that anymore. They're fast when they get out of the pocket when they have to make decisions, but I didn't snap the ball unless I knew what they were doing... The one benefit you have as a quarterback before you snap the ball, you know where everybody on your team is running... If I look at the defense and I say 'None of my guys are going to be open based on this coverage', I don't need to snap the ball. I can run something different."
              </Text>
              <Text style={styles.quoteAuthor}>— Tom Brady</Text>
            </View>
            
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionTitle}>🎯 Learn Like Brady:</Text>
              <Text style={styles.descriptionText}>
                • Read the defensive formation{'\n'}
                • Identify coverage and personnel{'\n'}
                • Select the right play to attack{'\n'}
                • Master pre-snap decision making
              </Text>
            </View>

            {stats && (
              <View style={styles.statsBox}>
                <Text style={styles.statsTitle}>📊 Comprehensive Training:</Text>
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
            <Text style={styles.sectionTitleLarge}>🚀 Start Training</Text>
            
            <TouchableOpacity 
              style={styles.primaryButtonLarge}
              onPress={() => navigation.navigate('Game')}
            >
              <Text style={styles.primaryButtonTextLarge}>🎮 Play Game</Text>
              <Text style={styles.buttonSubtext}>Test your pre-snap reads</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButtonLarge}
              onPress={() => navigation.navigate('Library')}
            >
              <Text style={styles.secondaryButtonTextLarge}>📚 Study Formations</Text>
              <Text style={styles.buttonSubtext}>Learn defensive schemes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.tertiaryButtonLarge}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.tertiaryButtonTextLarge}>⚙️ Settings</Text>
              <Text style={styles.buttonSubtext}>Customize difficulty</Text>
            </TouchableOpacity>

            {/* New Feature Highlight */}
            <View style={styles.featureHighlight}>
              <Text style={styles.featureTitle}>🆕 Formation Comparison</Text>
              <Text style={styles.featureDescription}>
                Analyze offensive vs defensive matchups
              </Text>
              <TouchableOpacity 
                style={styles.featureButton}
                onPress={() => navigation.navigate('FormationComparison')}
              >
                <Text style={styles.featureButtonText}>Try It Out →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer for Educational Mission */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>🎓 Built for Young Football Minds</Text>
          <Text style={styles.footerText}>
            Designed to help middle school, high school, and young quarterbacks develop the mental side of the game. Learn to read defenses like Tom Brady and make smarter decisions at the line of scrimmage.
          </Text>
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
  headerBar: {
    backgroundColor: '#1f4e79',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  titleLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitleLarge: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    padding: 20,
  },
  horizontalContent: {
    flexDirection: 'row',
    gap: 20,
    minHeight: '100%',
  },
  verticalContent: {
    minHeight: '100%',
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

  // Enhanced Quote Styling
  quoteContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#1f4e79',
  },
  quoteTextLarge: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#2c3e50',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f4e79',
    textAlign: 'center',
  },

  // Description and Stats
  descriptionBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  statsBox: {
    backgroundColor: '#ecfdf5',
    borderRadius: 10,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },

  // Enhanced Buttons
  sectionTitleLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 20,
    textAlign: 'center',
  },
  primaryButtonLarge: {
    backgroundColor: '#1f4e79',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonTextLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  secondaryButtonLarge: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonTextLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  tertiaryButtonLarge: {
    backgroundColor: '#6b7280',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tertiaryButtonTextLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'center',
  },

  // Feature Highlight
  featureHighlight: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    marginTop: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: '#b45309',
    marginBottom: 12,
    lineHeight: 18,
  },
  featureButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  featureButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },

  // Footer
  footer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 8,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    textAlign: 'center',
  },
});