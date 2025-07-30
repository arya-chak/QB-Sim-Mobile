import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default function SettingsScreen({ navigation }) {
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';
  
  // State for selected difficulty mode
  const [selectedDifficulty, setSelectedDifficulty] = useState('rookie');

  // Difficulty mode configurations (from your Streamlit app)
  const difficultyModes = {
    rookie: {
      name: '👶 Rookie Mode',
      description: 'See most defensive information (great for learning)',
      explanation: 'Perfect for learning! You can see formation names, personnel, coverage names, coverage types, and number of rushers. This helps you understand what real QBs are trying to identify.',
      settings: {
        formation_name: true,
        personnel: true,
        coverage_name: true,
        coverage_type: true,
        blitz_name: false,
        rushers: true,
        coverage_adjustment: false,
        field_visual: true
      }
    },
    pro: {
        name: '🧠 Pro Mode',
        description: 'Realistic pre-snap reads only',
        explanation: 'This is how real QBs see the defense before the snap! You can identify the formation and count personnel (which is visible on the field), but coverage schemes and blitz packages are much harder to determine. This creates a realistic challenge where you must make decisions based on limited information.',
        settings: {
            formation_name: true,
            personnel: true,
            coverage_name: false,
            coverage_type: false,
            blitz_name: false,
            rushers: false,
            coverage_adjustment: false,
            field_visual: true
        }
    },
    elite: {
      name: '🔥 Elite Mode', 
      description: 'Visual only - minimal information',
      explanation: 'Coming soon...',
      settings: {
        formation_name: false,
        personnel: false,
        coverage_name: false,
        coverage_type: false,
        blitz_name: false,
        rushers: false,
        coverage_adjustment: false,
        field_visual: true
      }
    },
    custom: {
      name: '🎮 Custom Mode',
      description: 'Choose exactly what you can see',
      explanation: 'Coming soon...',
      settings: {
        formation_name: true,
        personnel: true,
        coverage_name: false,
        coverage_type: false,
        blitz_name: false,
        rushers: false,
        coverage_adjustment: false,
        field_visual: true
      }
    }
  };

  const handleSaveSettings = async () => {
    try {
        const currentSettings = difficultyModes[selectedDifficulty];
        await AsyncStorage.setItem('visibilitySettings', JSON.stringify(currentSettings.settings));
        console.log('Settings saved:', currentSettings.settings);
        Alert.alert('Settings Saved', `${currentSettings.name} difficulty has been applied!`);
        navigation.goBack();
    } catch (error) {
        console.error('Error saving settings:', error);
        Alert.alert('Error', 'Could not save settings');
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonHeader}>
          <Text style={styles.backButtonHeaderText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.titleLarge}>⚙️ Difficulty Settings</Text>
        <TouchableOpacity onPress={handleSaveSettings} style={styles.saveButtonHeader}>
          <Text style={styles.saveButtonHeaderText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.scrollContentContainer}>
        <View style={isLandscape ? styles.horizontalContent : styles.verticalContent}>
          
          {/* Left Panel - Difficulty Selection */}
          <View style={isLandscape ? styles.leftPanel : styles.fullPanel}>
            <Text style={styles.sectionTitleLarge}>🎮 Choose Your Difficulty</Text>
            <Text style={styles.explanationText}>
              Control what defensive information you can see pre-snap. Real QBs have limited information before the ball is snapped!
            </Text>

            {Object.entries(difficultyModes).map(([key, mode]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.difficultyButton,
                  selectedDifficulty === key && styles.difficultyButtonActive
                ]}
                onPress={() => setSelectedDifficulty(key)}
              >
                <Text style={[
                  styles.difficultyButtonTitle,
                  selectedDifficulty === key && styles.difficultyButtonTitleActive
                ]}>
                  {mode.name}
                </Text>
                <Text style={[
                  styles.difficultyButtonDesc,
                  selectedDifficulty === key && styles.difficultyButtonDescActive
                ]}>
                  {mode.description}
                </Text>
                {selectedDifficulty === key && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>✓ Selected</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Right Panel - Selected Mode Details */}
          <View style={isLandscape ? styles.rightPanel : styles.fullPanel}>
            <Text style={styles.sectionTitleLarge}>
              {difficultyModes[selectedDifficulty].name} Details
            </Text>
            
            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>What You'll See:</Text>
              <Text style={styles.explanationText}>
                {difficultyModes[selectedDifficulty].explanation}
              </Text>
            </View>

            {/* Show what information will be visible */}
            <View style={styles.visibilityPreview}>
              <Text style={styles.visibilityTitle}>📋 Information Visibility:</Text>
              
              {Object.entries(difficultyModes[selectedDifficulty].settings).map(([setting, visible]) => (
                <View key={setting} style={styles.visibilityRow}>
                  <Text style={styles.visibilityLabel}>
                    {getSettingLabel(setting)}
                  </Text>
                  <Text style={[
                    styles.visibilityStatus,
                    visible ? styles.visibilityVisible : styles.visibilityHidden
                  ]}>
                    {visible ? '✓ Visible' : '✗ Hidden'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Real QB Information */}
            <View style={styles.realQBBox}>
              <Text style={styles.realQBTitle}>💡 Real QB Info:</Text>
              <Text style={styles.realQBText}>
                Real quarterbacks can usually identify the formation and count personnel, but coverage schemes and blitz packages are much harder to determine before the snap!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to convert setting keys to readable labels
const getSettingLabel = (setting) => {
  const labels = {
    formation_name: '📋 Formation Name',
    personnel: '👥 Personnel Package', 
    coverage_name: '🎯 Coverage Name',
    coverage_type: '🔍 Coverage Type',
    blitz_name: '🔥 Blitz Package',
    rushers: '⚡ Number of Rushers',
    coverage_adjustment: '🔄 Coverage Adjustment',
    field_visual: '🏈 Field Visual'
  };
  return labels[setting] || setting;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Header
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
  saveButtonHeader: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  saveButtonHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Layout
  horizontalContent: {
    flexDirection: 'row',
    gap: 20,
    minHeight: '100%',
  },
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
  explanationText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 24,
  },

  // Difficulty Buttons
  difficultyButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
  },
  difficultyButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  difficultyButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  difficultyButtonTitleActive: {
    color: '#1d4ed8',
  },
  difficultyButtonDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  difficultyButtonDescActive: {
    color: '#3730a3',
  },
  selectedIndicator: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#10b981',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  selectedIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Right Panel Content
  explanationBox: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 8,
  },

  // Visibility Preview
  visibilityPreview: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  visibilityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 12,
  },
  visibilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  visibilityLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  visibilityStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  visibilityVisible: {
    color: '#10b981',
  },
  visibilityHidden: {
    color: '#ef4444',
  },

  // Real QB Info
  realQBBox: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    padding: 16,
    borderRadius: 8,
  },
  realQBTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  realQBText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
});