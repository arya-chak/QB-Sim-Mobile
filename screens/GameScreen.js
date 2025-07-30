import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Helper functions
const getFormationEmoji = (formationName) => {
  const emojiMap = {
    'i-form': '🏃',
    'singleback': '⚔️',
    'shotgun': '⚡',
    'trips': '📐',
    'bunch': '🎯',
    'empty': '🌊',
    'goal line': '💪'
  };
  return emojiMap[formationName] || '🏈';
};

const getAppropriatenessStyle = (category) => {
  const styleMap = {
    'Perfect': { color: '#10b981', fontWeight: 'bold' },
    'Good': { color: '#059669', fontWeight: '600' },
    'Average': { color: '#f59e0b', fontWeight: '600' },
    'Poor': { color: '#dc2626', fontWeight: '600' },
    'Terrible': { color: '#991b1b', fontWeight: 'bold' },
    'Overkill': { color: '#3b82f6', fontWeight: '600' }
  };
  return styleMap[category] || { color: '#6b7280' };
};

export default function GameScreen({ navigation }) {
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';
  
  const [defensiveScenario, setDefensiveScenario] = useState(null);
  const [offensiveFormations, setOffensiveFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minimumYards, setMinimumYards] = useState(0);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [formationPlays, setFormationPlays] = useState([]);
  const [playResult, setPlayResult] = useState(null);
  const [visibilitySettings, setVisibilitySettings] = useState({
    formation_name: true,
    personnel: true,
    coverage_name: true,
    coverage_type: true,
    blitz_name: false,
    rushers: true,
    coverage_adjustment: false,
    field_visual: true
  });

  // Load data when screen loads
  useEffect(() => {
    loadDefensiveScenario();
    loadOffensiveFormations();
    loadVisibilitySettings();
  }, []);

  // Load visibility settings when screen gains focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadVisibilitySettings();
    });
    return unsubscribe;
  }, [navigation]);

  const loadVisibilitySettings = async () => {
  try {
    const savedSettings = await AsyncStorage.getItem('visibilitySettings');
    console.log('Loaded settings from storage:', savedSettings); // Add this line
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      console.log('Parsed settings:', parsedSettings); // Add this line
      setVisibilitySettings(parsedSettings);
    }
  } catch (error) {
    console.error('Error loading visibility settings:', error);
  }
};

  const loadDefensiveScenario = async () => {
    try {
      setLoading(true);
      const scenarioData = await ApiService.getDefensiveScenario();
      setDefensiveScenario(scenarioData.scenario);
      setMinimumYards(scenarioData.minimum_yards);
    } catch (error) {
      Alert.alert('Error', 'Could not load defensive scenario. Make sure your API server is running.');
      console.error('Error loading defensive scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOffensiveFormations = async () => {
    try {
      const formations = await ApiService.getOffensiveFormations();
      setOffensiveFormations(formations);
    } catch (error) {
      Alert.alert('Error', 'Could not load offensive formations.');
      console.error('Error loading formations:', error);
    }
  };

  const selectFormation = async (formation) => {
    try {
      setSelectedFormation(formation);
      const plays = await ApiService.getFormationPlays(formation.name);
      setFormationPlays(plays);
    } catch (error) {
      Alert.alert('Error', 'Could not load plays for this formation.');
      console.error('Error loading plays:', error);
    }
  };

  const executePlay = async (play) => {
    try {
      setLoading(true);
      const result = await ApiService.simulatePlay(play, defensiveScenario, minimumYards);
      setPlayResult(result);
    } catch (error) {
      Alert.alert('Error', 'Could not simulate play.');
      console.error('Error simulating play:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetScenario = () => {
    setSelectedFormation(null);
    setFormationPlays([]);
    setPlayResult(null);
    loadDefensiveScenario();
  };

  const retryScenario = () => {
    setSelectedFormation(null);
    setFormationPlays([]);
    setPlayResult(null);
    // Keep the same scenario, don't reload
  };

  if (loading && !defensiveScenario) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1f4e79" />
          <Text style={styles.loadingText}>Loading defensive scenario...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show play result screen - horizontal layout
  if (playResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonHeader}>
            <Text style={styles.backButtonHeaderText}>← Home</Text>
          </TouchableOpacity>
          <Text style={styles.titleLarge}>📊 Play Result</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={retryScenario} style={styles.headerActionButton}>
              <Text style={styles.headerActionButtonText}>🔄 Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={resetScenario} style={styles.headerActionButton}>
              <Text style={styles.headerActionButtonText}>🎲 New</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.scrollContentContainer}>
          <View style={isLandscape ? styles.horizontalContent : styles.verticalContent}>
            {/* Left Panel - Result Details */}
            <View style={isLandscape ? styles.leftPanel : styles.fullPanel}>
              <View style={[styles.resultBox, playResult.success ? styles.successBox : styles.failureBox]}>
                <Text style={styles.resultTitle}>
                  {playResult.success ? '✅ SUCCESS!' : '❌ FAILURE!'}
                </Text>
                <Text style={styles.resultYards}>
                  {playResult.yards_gained} yards gained (needed {playResult.yards_needed})
                </Text>
              </View>

              <View style={styles.resultDetailsBox}>
                <Text style={styles.sectionTitle}>📋 Play Analysis</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Appropriateness:</Text>
                  <Text style={[styles.infoValue, getAppropriatenessStyle(playResult.appropriateness_category)]}>
                    {playResult.appropriateness_category}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Outcome:</Text>
                  <Text style={styles.infoValue}>{playResult.outcome_type.replace('_', ' ')}</Text>
                </View>
                <Text style={styles.description}>{playResult.description}</Text>
                
                {/* Learning Analysis - Similar to Streamlit version */}
                <View style={styles.learningBox}>
                  <Text style={styles.learningTitle}>🧑‍🏫 Learning Analysis</Text>
                  {renderLearningAnalysis(playResult.appropriateness_category)}
                </View>
              </View>
            </View>

            {/* Right Panel - Action Buttons */}
            <View style={isLandscape ? styles.rightPanel : styles.fullPanel}>
              <Text style={styles.sectionTitleLarge}>What's Next?</Text>
              
              <TouchableOpacity 
                style={styles.primaryButtonLarge}
                onPress={retryScenario}
              >
                <Text style={styles.primaryButtonTextLarge}>🔄 Try Same Scenario</Text>
                <Text style={styles.buttonSubtext}>Keep practicing this defense</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButtonLarge}
                onPress={resetScenario}
              >
                <Text style={styles.secondaryButtonTextLarge}>🎲 New Scenario</Text>
                <Text style={styles.buttonSubtext}>Get a different defensive look</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.tertiaryButtonLarge}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.tertiaryButtonTextLarge}>🏠 Back to Home</Text>
                <Text style={styles.buttonSubtext}>Main menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main game screen - horizontal layout
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonHeader}>
          <Text style={styles.backButtonHeaderText}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.titleLarge}>🛡️ Read the Defense</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.headerActionButton}>
            <Text style={styles.headerActionButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={resetScenario} style={styles.headerActionButton}>
            <Text style={styles.headerActionButtonText}>🎲 New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.scrollContentContainer}>
        <View style={isLandscape ? styles.horizontalContent : styles.verticalContent}>
          {/* Left Panel - Defensive Information */}
          <View style={isLandscape ? styles.leftPanel : styles.fullPanel}>
            {/* Yards Needed */}
            <View style={styles.yardsNeededBox}>
              <Text style={styles.yardsNeededText}>
                🎯 YOU NEED {minimumYards} YARDS
              </Text>
            </View>

            {/* Defensive Information */}
            {defensiveScenario && (
              <View style={styles.defenseInfoBox}>
                <Text style={styles.sectionTitle}>🛡️ Defensive Setup</Text>
                
                {visibilitySettings.formation_name && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Formation:</Text>
                    <Text style={styles.infoValue}>{defensiveScenario.formation_data.formation_name}</Text>
                  </View>
                )}
                
                {visibilitySettings.personnel && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Personnel:</Text>
                    <Text style={styles.infoValue}>{defensiveScenario.formation_data.personnel}</Text>
                  </View>
                )}
                
                {visibilitySettings.coverage_name && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Coverage:</Text>
                    <Text style={styles.infoValue}>{defensiveScenario.coverage_data.name}</Text>
                  </View>
                )}
                
                {visibilitySettings.coverage_type && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Type:</Text>
                    <Text style={styles.infoValue}>{defensiveScenario.coverage_data.coverage_type}</Text>
                  </View>
                )}
                
                {visibilitySettings.blitz_name && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Blitz Package:</Text>
                    <Text style={styles.infoValue}>{defensiveScenario.blitz_data.name}</Text>
                  </View>
                )}
                
                {visibilitySettings.rushers && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Rushers:</Text>
                    <Text style={styles.infoValue}>{defensiveScenario.blitz_data.rushers}</Text>
                  </View>
                )}
                
                {visibilitySettings.coverage_adjustment && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Coverage Adjustment:</Text>
                    <Text style={styles.infoValue}>{defensiveScenario.blitz_data.coverage_adjustment}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Placeholder for field visual */}
            <View style={styles.fieldVisualBox}>
              <Text style={styles.fieldVisualTitle}>🏈 Field Visual</Text>
              <View style={styles.fieldPlaceholder}>
                <Text style={styles.fieldPlaceholderText}>
                  [X's and O's diagram]{'\n'}
                  Coming in next update
                </Text>
              </View>
            </View>
          </View>

          {/* Right Panel - Offensive Selections */}
          <View style={isLandscape ? styles.rightPanel : styles.fullPanel}>
            {!selectedFormation ? (
              // Formation Selection
              <>
                <Text style={styles.sectionTitleLarge}>⚔️ Select Your Formation</Text>
                <ScrollView style={styles.selectionScrollView} nestedScrollEnabled={true}>
                  {offensiveFormations.map((formation, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.formationButtonLarge}
                      onPress={() => selectFormation(formation)}
                    >
                      <Text style={styles.formationButtonTitle}>
                        {getFormationEmoji(formation.name)} {formation.display_name}
                      </Text>
                      <Text style={styles.formationButtonSubtitle}>
                        {formation.personnel} • {formation.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : (
              // Play Selection
              <>
                <View style={styles.playSelectionHeader}>
                  <Text style={styles.sectionTitleLarge}>🏈 Select Your Play</Text>
                  <TouchableOpacity 
                    style={styles.changeFormationButton}
                    onPress={() => setSelectedFormation(null)}
                  >
                    <Text style={styles.changeFormationButtonText}>← Change Formation</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.selectedFormationText}>
                  Formation: {selectedFormation.display_name}
                </Text>
                
                <ScrollView style={styles.selectionScrollView} nestedScrollEnabled={true}>
                  {formationPlays.map((play, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.playButtonLarge}
                      onPress={() => executePlay(play)}
                    >
                      <Text style={styles.playButtonTitle}>
                        {play.type === 'Pass' ? '🎯' : '🏃'} {play.name}
                      </Text>
                      <Text style={styles.playButtonSubtitle}>
                        {play.concept} • {play.type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1f4e79" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// Learning Analysis Component - matches Streamlit feedback
const renderLearningAnalysis = (appropriateness) => {
  const analysisMap = {
    'Perfect': {
      style: styles.perfectAnalysis,
      text: "📚 EXCELLENT READ! 🎯 This was a Perfect call - you correctly identified and exploited a weakness in this defense!"
    },
    'Good': {
      style: styles.goodAnalysis,
      text: "📚 GOOD READ! ✅ This was a solid choice that worked well against this defensive setup."
    },
    'Average': {
      style: styles.averageAnalysis,
      text: "📚 DECENT READ ⚖️ This was an Average call - not bad, but there were better options available against this defense."
    },
    'Poor': {
      style: styles.poorAnalysis,
      text: "📚 LEARNING MOMENT ⚠️ This was a Poor choice - the defense had advantages. Study what they were showing!"
    },
    'Terrible': {
      style: styles.terribleAnalysis,
      text: "📚 TOUGH LESSON ❌ This was a Terrible call - this defense was set up perfectly to stop that play. Learn from this!"
    },
    'Overkill': {
      style: styles.overkillAnalysis,
      text: "📚 CREATIVE CHOICE 🚀 This was Overkill - it worked but was more complex than needed for this situation."
    }
  };

  const analysis = analysisMap[appropriateness] || analysisMap['Average'];

  return (
    <View style={analysis.style}>
      <Text style={styles.analysisText}>{analysis.text}</Text>
    </View>
  );
};

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
  backButtonHeader: {
    padding: 8,
  },
  backButtonHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerActionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  headerActionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 12,
  },

  // Info Boxes
  yardsNeededBox: {
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#ffc107',
    marginBottom: 20,
  },
  yardsNeededText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#856404',
    textAlign: 'center',
  },
  defenseInfoBox: {
    backgroundColor: '#f0f2f6',
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#1f4e79',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#6b7280',
    flex: 1,
    textAlign: 'right',
  },

  // Field Visual
  fieldVisualBox: {
    backgroundColor: '#e8f5e8',
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#10b981',
    padding: 20,
  },
  fieldVisualTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 12,
  },
  fieldPlaceholder: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#9ca3af',
  },
  fieldPlaceholderText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
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

  // Formation and Play Selection
  selectionScrollView: {
    flex: 1,
    maxHeight: 400,
  },
  formationButtonLarge: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  formationButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  formationButtonSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  playSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  changeFormationButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  changeFormationButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedFormationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 16,
    textAlign: 'center',
  },
  playButtonLarge: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  playButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  playButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  // Results
  resultBox: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  successBox: {
    backgroundColor: '#d4edda',
    borderLeftWidth: 5,
    borderLeftColor: '#28a745',
  },
  failureBox: {
    backgroundColor: '#f8d7da',
    borderLeftWidth: 5,
    borderLeftColor: '#dc3545',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultYards: {
    fontSize: 18,
    fontWeight: '600',
  },
  resultDetailsBox: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#495057',
    marginTop: 12,
    fontStyle: 'italic',
    lineHeight: 22,
  },

  // Learning Analysis Styles
  learningBox: {
    marginTop: 20,
    borderRadius: 8,
  },
  learningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 12,
  },
  perfectAnalysis: {
    backgroundColor: '#d4edda',
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
    padding: 16,
    borderRadius: 8,
  },
  goodAnalysis: {
    backgroundColor: '#d4edda',
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
    padding: 16,
    borderRadius: 8,
  },
  averageAnalysis: {
    backgroundColor: '#d1ecf1',
    borderLeftWidth: 4,
    borderLeftColor: '#bee5eb',
    padding: 16,
    borderRadius: 8,
  },
  poorAnalysis: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffeaa7',
    padding: 16,
    borderRadius: 8,
  },
  terribleAnalysis: {
    backgroundColor: '#f8d7da',
    borderLeftWidth: 4,
    borderLeftColor: '#f5c6cb',
    padding: 16,
    borderRadius: 8,
  },
  overkillAnalysis: {
    backgroundColor: '#d1ecf1',
    borderLeftWidth: 4,
    borderLeftColor: '#bee5eb',
    padding: 16,
    borderRadius: 8,
  },
  analysisText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 18,
    color: '#1f4e79',
    fontWeight: '600',
  },
});