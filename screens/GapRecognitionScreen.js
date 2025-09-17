import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GapScenarioService } from '../services/GapScenarioService';
import GapDefensiveVisual from '../components/field/GapDefensiveVisual';
import GapOffensiveVisual from '../components/field/GapOffensiveVisual';
import GapSelectionInterface from '../components/game/GapSelectionInterface';

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

// Helper function to get scenario emoji
const getScenarioEmoji = (formation) => {
  const emojiMap = {
    '4-3': '🛡️',
    '3-4': '⚔️', 
    '46': '🔥',
    'nickel': '⚡',
    'dime': '💎',
    '5-2': '💪',
    '4-4': '⚖️'
  };
  return emojiMap[formation.toLowerCase().replace(' defense', '')] || '🏈';
};

// Helper function to get difficulty color
const getDifficultyStyle = (difficulty) => {
  const styleMap = {
    'Easy': { color: '#10b981', backgroundColor: '#d1fae5' },
    'Medium': { color: '#f59e0b', backgroundColor: '#fef3c7' },
    'Hard': { color: '#ef4444', backgroundColor: '#fee2e2' },
    'Expert': { color: '#8b5cf6', backgroundColor: '#ede9fe' }
  };
  return styleMap[difficulty] || { color: '#6b7280', backgroundColor: '#f3f4f6' };
};

function GapRecognitionScreen({ navigation }) {
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';
  
  // Core game state
  const [currentScenario, setCurrentScenario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedGap, setSelectedGap] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Game statistics
  const [gapStats, setGapStats] = useState({
    total_attempts: 0,
    correct_choices: 0,
    scenarios_completed: 0,
    best_streak: 0,
    current_streak: 0
  });

  // Settings state
  const [gameSettings, setGameSettings] = useState({
    show_pressure_arrows: true,
    show_gap_labels: true,
    show_blocking_scheme: true,
    show_assignments: true,
    difficulty: 'Medium'
  });

  useEffect(() => {
    loadGameSettings();
    loadGameStats();
  }, []);

  const loadGameSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('gapRecognitionSettings');
      if (savedSettings) {
        setGameSettings({ ...gameSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Error loading gap recognition settings:', error);
    }
  };

  const loadGameStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem('gapRecognitionStats');
      if (savedStats) {
        setGapStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('Error loading gap recognition stats:', error);
    }
  };

  const saveGameStats = async (newStats) => {
    try {
      await AsyncStorage.setItem('gapRecognitionStats', JSON.stringify(newStats));
      setGapStats(newStats);
    } catch (error) {
      console.error('Error saving gap recognition stats:', error);
    }
  };

  const generateNewScenario = async () => {
    try {
      setLoading(true);
      setSelectedGap(null);
      setShowResult(false);
      setAnalysisResult(null);

      // Get random scenario from service
      const scenario = await GapScenarioService.getRandomGapScenario();
      setCurrentScenario(scenario);
      
      if (!gameStarted) {
        setGameStarted(true);
      }

    } catch (error) {
      console.error('Error generating scenario:', error);
      Alert.alert(
        'Error',
        'Failed to load gap scenario. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGapSelected = (gapKey, gapOption) => {
    setSelectedGap(gapKey);
    // Don't analyze yet - wait for user to click analyze button
  };

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setShowResult(true);
    
    // Update statistics
    const newStats = {
      ...gapStats,
      total_attempts: gapStats.total_attempts + 1,
      correct_choices: result.is_correct ? gapStats.correct_choices + 1 : gapStats.correct_choices,
      current_streak: result.is_correct ? gapStats.current_streak + 1 : 0,
      best_streak: result.is_correct && (gapStats.current_streak + 1) > gapStats.best_streak 
        ? gapStats.current_streak + 1 
        : gapStats.best_streak
    };
    
    saveGameStats(newStats);
  };

  const nextScenario = () => {
    if (showResult) {
      const newStats = {
        ...gapStats,
        scenarios_completed: gapStats.scenarios_completed + 1
      };
      saveGameStats(newStats);
    }
    generateNewScenario();
  };

  const handlePlayerPress = (player) => {
    // Could add player detail popup here
    console.log('Player pressed:', player);
  };

  const getSuccessRate = () => {
    if (gapStats.total_attempts === 0) return 0;
    return Math.round((gapStats.correct_choices / gapStats.total_attempts) * 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonHeader}>
          <Text style={styles.backButtonHeaderText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.titleLarge}>🏃‍♂️ Gap Recognition</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsButtonHeader}>
          <Text style={styles.settingsButtonHeaderText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Game Statistics Bar */}
      {gameStarted && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{getSuccessRate()}%</Text>
            <Text style={styles.statLabel}>Success</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{gapStats.current_streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{gapStats.scenarios_completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      )}

      {/* Main Content */}
      <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.scrollContentContainer}>
        {!gameStarted ? (
          // Welcome Screen
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>🎯 Gap Recognition Training</Text>
            <Text style={styles.welcomeSubtitle}>
              Learn to identify the best running gaps by analyzing defensive fronts and offensive blocking schemes
            </Text>
            
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>📋 How to Play:</Text>
              <Text style={styles.instructionText}>• Study the defensive front 7 alignment and pressure directions</Text>
              <Text style={styles.instructionText}>• Analyze the offensive line blocking scheme</Text>
              <Text style={styles.instructionText}>• Choose the gap with the best success probability</Text>
              <Text style={styles.instructionText}>• Get instant feedback on your tactical decision</Text>
            </View>

            <TouchableOpacity 
              style={styles.startGameButton}
              onPress={generateNewScenario}
              disabled={loading}
            >
              <Text style={styles.startGameButtonText}>
                {loading ? '🔄 Loading...' : '🚀 Start Gap Training'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Game Content
          <View style={isLandscape ? styles.horizontalContent : styles.verticalContent}>
            
            {/* Left Panel - Defensive and Offensive Visuals */}
            <View style={isLandscape ? styles.leftPanel : styles.fullPanel}>
              
              {/* Scenario Header */}
              {currentScenario && (
                <View style={styles.scenarioHeader}>
                  <View style={styles.scenarioTitleContainer}>
                    <Text style={styles.scenarioEmoji}>
                      {getScenarioEmoji(currentScenario.defense?.formation || '')}
                    </Text>
                    <View>
                      <Text style={styles.scenarioTitle}>
                        {currentScenario.scenario_name || 'Gap Recognition Scenario'}
                      </Text>
                      <Text style={styles.scenarioDescription}>
                        {currentScenario.description || 'Analyze the formation and find the best gap'}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.newScenarioButton}
                    onPress={generateNewScenario}
                    disabled={loading}
                  >
                    <Text style={styles.newScenarioButtonText}>
                      {loading ? '🔄' : '🎲 New'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Defensive Visual */}
              {currentScenario && (
                <View style={styles.visualSection}>
                  <GapDefensiveVisual
                    scenarioData={currentScenario}
                    showPressureArrows={gameSettings.show_pressure_arrows}
                    showGapLabels={gameSettings.show_gap_labels}
                    onPlayerPress={handlePlayerPress}
                  />
                </View>
              )}

              {/* Offensive Visual */}
              {currentScenario && (
                <View style={styles.visualSection}>
                  <GapOffensiveVisual
                    scenarioData={currentScenario}
                    showBlockingScheme={gameSettings.show_blocking_scheme}
                    showAssignments={gameSettings.show_assignments}
                    onPlayerPress={handlePlayerPress}
                  />
                </View>
              )}
            </View>

            {/* Right Panel - Gap Selection Interface */}
            <View style={isLandscape ? styles.rightPanel : styles.fullPanel}>
              {currentScenario && (
                <GapSelectionInterface
                  scenarioData={currentScenario}
                  onGapSelected={handleGapSelected}
                  onAnalysisComplete={handleAnalysisComplete}
                  disabled={loading}
                  showResult={showResult}
                />
              )}

              {/* Next Scenario Button */}
              {showResult && (
                <View style={styles.nextScenarioContainer}>
                  <TouchableOpacity 
                    style={styles.nextScenarioButton}
                    onPress={nextScenario}
                  >
                    <Text style={styles.nextScenarioButtonText}>
                      ➡️ Next Scenario
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Performance Summary */}
              {showResult && analysisResult && (
                <View style={styles.performanceSummary}>
                  <Text style={styles.performanceSummaryTitle}>📊 Your Performance</Text>
                  <View style={styles.performanceStats}>
                    <View style={styles.performanceStat}>
                      <Text style={styles.performanceStatNumber}>{getSuccessRate()}%</Text>
                      <Text style={styles.performanceStatLabel}>Overall Success</Text>
                    </View>
                    <View style={styles.performanceStat}>
                      <Text style={[styles.performanceStatNumber, { color: '#10b981' }]}>
                        {gapStats.current_streak}
                      </Text>
                      <Text style={styles.performanceStatLabel}>Current Streak</Text>
                    </View>
                    <View style={styles.performanceStat}>
                      <Text style={[styles.performanceStatNumber, { color: '#f59e0b' }]}>
                        {gapStats.best_streak}
                      </Text>
                      <Text style={styles.performanceStatLabel}>Best Streak</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading scenario...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// Styles following existing pattern
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1f4e79',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButtonHeader: {
    padding: 8,
  },
  backButtonHeaderText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  titleLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
  },
  settingsButtonHeader: {
    padding: 8,
  },
  settingsButtonHeaderText: {
    color: '#ffffff',
    fontSize: 18,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4e79',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    padding: 16,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  instructionsContainer: {
    backgroundColor: '#f0f9ff',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
    marginBottom: 32,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0c4a6e',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#0e7490',
    marginBottom: 6,
    lineHeight: 20,
  },
  startGameButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startGameButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  horizontalContent: {
    flexDirection: 'row',
    flex: 1,
  },
  verticalContent: {
    flexDirection: 'column',
    flex: 1,
  },
  leftPanel: {
    flex: 2,
    marginRight: 16,
  },
  rightPanel: {
    flex: 1,
  },
  fullPanel: {
    flex: 1,
    marginBottom: 16,
  },
  scenarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scenarioTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scenarioEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  scenarioDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  newScenarioButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  newScenarioButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  visualSection: {
    marginBottom: 16,
  },
  nextScenarioContainer: {
    marginTop: 20,
  },
  nextScenarioButton: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextScenarioButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  performanceSummary: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  performanceSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceStat: {
    alignItems: 'center',
  },
  performanceStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f4e79',
  },
  performanceStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 12,
  },
});

export default GapRecognitionScreen;