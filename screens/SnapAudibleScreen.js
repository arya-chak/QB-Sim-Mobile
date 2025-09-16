// SnapAudibleScreen.js - Snap or Audible game mode

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/ApiService';
import SVGFieldVisualizer from '../components/field/SVGFieldVisualizer';

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

export default function SnapAudibleScreen({ navigation }) {
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';

  // Core game state - simplified to match main game mode structure
  const [loading, setLoading] = useState(false);
  const [defensiveScenario, setDefensiveScenario] = useState(null);
  const [minimumYards, setMinimumYards] = useState(10);
  const [preSelectedPlay, setPreSelectedPlay] = useState(null);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [playResult, setPlayResult] = useState(null);
  const [showingResult, setShowingResult] = useState(false);
  
  // Visibility settings state
  const [visibilitySettings, setVisibilitySettings] = useState({
    formation_name: true,
    personnel: true,
    coverage_name: false,
    coverage_type: false,
    blitz_name: false,
    rushers: false,
    coverage_adjustment: false,
    field_visual: true
  });
  
  // Game statistics specific to snap/audible mode
  const [snapAudibleStats, setSnapAudibleStats] = useState({
    total_decisions: 0,
    correct_decisions: 0,
    snap_decisions: 0,
    audible_decisions: 0,
    correct_snaps: 0,
    correct_audibles: 0
  });

  // Load saved stats, visibility settings, and initial scenario on component mount
  useEffect(() => {
    loadSnapAudibleStats();
    loadVisibilitySettings();
    loadNewScenario();
  }, []);

  // Focus effect to reload visibility settings when returning from Settings
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadVisibilitySettings();
    });
    return unsubscribe;
  }, [navigation]);

  const loadSnapAudibleStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem('snapAudibleStats');
      if (savedStats) {
        setSnapAudibleStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('Error loading snap/audible stats:', error);
    }
  };

  const loadVisibilitySettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('visibilitySettings');
      if (savedSettings) {
        setVisibilitySettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading visibility settings:', error);
    }
  };

  const saveSnapAudibleStats = async (newStats) => {
    try {
      await AsyncStorage.setItem('snapAudibleStats', JSON.stringify(newStats));
      setSnapAudibleStats(newStats);
    } catch (error) {
      console.error('Error saving snap/audible stats:', error);
    }
  };

  const loadNewScenario = async () => {
    try {
      setLoading(true);
      setShowingResult(false);
      setPlayerChoice(null);
      setPlayResult(null);
      setPreSelectedPlay(null);
      
      // Load defensive scenario exactly like main game mode
      const scenarioData = await ApiService.getDefensiveScenario();
      setDefensiveScenario(scenarioData.scenario);
      setMinimumYards(scenarioData.minimum_yards);
      
      // Get strategic plays and pick one as the "given" play
      const strategicData = await ApiService.getStrategicPlays(
        scenarioData.scenario, 
        scenarioData.minimum_yards
      );
      
      // Pick one random play from the strategic plays
      const playOptions = [];
      Object.values(strategicData.strategic_plays).forEach(play => {
        if (play) playOptions.push(play);
      });
      
      if (playOptions.length > 0) {
        const randomPlay = playOptions[Math.floor(Math.random() * playOptions.length)];
        setPreSelectedPlay(randomPlay);
      }
      
    } catch (error) {
      Alert.alert('Error', 'Could not load scenario. Make sure your API server is running.');
      console.error('Error loading scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  const makeDecision = async (choice) => {
    try {
      setPlayerChoice(choice);
      setLoading(true);
      
      // Simulate the play using the same structure as main game mode
      const result = await ApiService.simulatePlay(
        preSelectedPlay,
        defensiveScenario,
        minimumYards
      );
      
      // Determine if the choice was correct
      const playWasSuccessful = result.success;
      const choiceWasCorrect = (choice === 'SNAP' && playWasSuccessful) || 
                               (choice === 'AUDIBLE' && !playWasSuccessful);
      
      // Create enhanced result for snap/audible mode
      const enhancedResult = {
        ...result,
        playerChoice: choice,
        choiceWasCorrect: choiceWasCorrect,
        explanation: getChoiceExplanation(choice, playWasSuccessful, result)
      };
      
      setPlayResult(enhancedResult);
      setShowingResult(true);
      
      // Update stats
      await updateSnapAudibleStats(choice, choiceWasCorrect, playWasSuccessful);
      
    } catch (error) {
      Alert.alert('Error', 'Could not process decision.');
      console.error('Error making decision:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChoiceExplanation = (choice, playWasSuccessful, result) => {
    if (choice === 'SNAP') {
      if (playWasSuccessful) {
        return `Great read! You correctly snapped the ball and the play worked for ${result.yards_gained} yards. The matchup favored your offense.`;
      } else {
        return `The defense was ready for this play. An audible might have been the better choice here - they had the right coverage/personnel to stop this concept.`;
      }
    } else { // AUDIBLE
      if (!playWasSuccessful) {
        return `Excellent recognition! You correctly identified that the defense was set up to stop this play. Calling an audible was the smart move.`;
      } else {
        return `This play actually would have worked for ${result.yards_gained} yards. Sometimes the matchup is better than it initially appears - but keep trusting your reads!`;
      }
    }
  };

  const updateSnapAudibleStats = async (choice, wasCorrect, playSucceeded) => {
    const newStats = {
      total_decisions: snapAudibleStats.total_decisions + 1,
      correct_decisions: snapAudibleStats.correct_decisions + (wasCorrect ? 1 : 0),
      snap_decisions: snapAudibleStats.snap_decisions + (choice === 'SNAP' ? 1 : 0),
      audible_decisions: snapAudibleStats.audible_decisions + (choice === 'AUDIBLE' ? 1 : 0),
      correct_snaps: snapAudibleStats.correct_snaps + (choice === 'SNAP' && wasCorrect ? 1 : 0),
      correct_audibles: snapAudibleStats.correct_audibles + (choice === 'AUDIBLE' && wasCorrect ? 1 : 0)
    };
    
    await saveSnapAudibleStats(newStats);
  };

  const resetStats = async () => {
    const initialStats = {
      total_decisions: 0,
      correct_decisions: 0,
      snap_decisions: 0,
      audible_decisions: 0,
      correct_snaps: 0,
      correct_audibles: 0
    };
    await saveSnapAudibleStats(initialStats);
    Alert.alert('Stats Reset', 'Snap or Audible statistics have been reset.');
  };

  // Helper function to determine difficulty level based on visibility settings
  const getDifficultyLevel = () => {
    const visibleCount = Object.values(visibilitySettings).filter(Boolean).length;
    const totalSettings = Object.keys(visibilitySettings).length;
    const visibilityPercentage = (visibleCount / totalSettings) * 100;
    
    if (visibilityPercentage >= 75) return { name: 'Rookie', color: '#10b981', emoji: '👶' };
    if (visibilityPercentage >= 50) return { name: 'Pro', color: '#3b82f6', emoji: '🧠' };
    if (visibilityPercentage >= 25) return { name: 'Elite', color: '#f59e0b', emoji: '🔥' };
    return { name: 'Legend', color: '#dc2626', emoji: '🏆' };
  };

  const formatPlayInfo = (play) => {
    if (!play) return { name: 'Loading...', formation: 'Loading...', type: 'Loading...', concept: 'Loading...' };
    const playData = play.play_data || play.comprehensive_data || {};
    return {
      name: playData.name || 'Unknown Play',
      formation: play.formation_name || 'Unknown Formation',
      type: playData.type || 'Unknown',
      concept: playData.concept || 'Unknown Concept'
    };
  };

  const handlePlayerPress = (player) => {
    Alert.alert(
      `${player.position} - ${player.name || 'Player'}`,
      `Position: ${player.type === 'dl' ? 'Defensive Line' : 
             player.type === 'lb' ? 'Linebacker' : 'Defensive Back'}${
             player.isBlitzing ? '\n🔥 BLITZING!' : ''
           }`,
      [{ text: 'OK' }]
    );
  };

  // Loading state
  if (loading || !defensiveScenario || !preSelectedPlay) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonHeader}>
            <Text style={styles.backButtonHeaderText}>← Home</Text>
          </TouchableOpacity>
          <Text style={styles.titleLarge}>🏈 Snap or Audible</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Preparing your scenario...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Results view
  if (showingResult && playResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonHeader}>
            <Text style={styles.backButtonHeaderText}>← Home</Text>
          </TouchableOpacity>
          <Text style={styles.titleLarge}>📊 Decision Result</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.scrollContentContainer}>
          <View style={isLandscape ? styles.horizontalContent : styles.verticalContent}>
            
            {/* Left Panel - Result Details */}
            <View style={isLandscape ? styles.leftPanel : styles.fullPanel}>
              
              {/* Decision Result */}
              <View style={[
                styles.resultBox, 
                playResult.choiceWasCorrect ? styles.correctBox : styles.incorrectBox
              ]}>
                <Text style={styles.resultTitle}>
                  {playResult.choiceWasCorrect ? '✅ CORRECT!' : '❌ INCORRECT'}
                </Text>
                <Text style={styles.resultChoice}>
                  You chose: {playResult.playerChoice}
                </Text>
                <Text style={styles.resultOutcome}>
                  Play result: {playResult.yards_gained} yards (needed {minimumYards})
                </Text>
              </View>

              {/* Play Details */}
              <View style={styles.playDetailsBox}>
                <Text style={styles.sectionTitle}>🏈 Play Breakdown</Text>
                {preSelectedPlay && (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Play Called:</Text>
                      <Text style={styles.infoValue}>{formatPlayInfo(preSelectedPlay).name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Formation:</Text>
                      <Text style={styles.infoValue}>{formatPlayInfo(preSelectedPlay).formation}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Concept:</Text>
                      <Text style={styles.infoValue}>{formatPlayInfo(preSelectedPlay).concept}</Text>
                    </View>
                  </>
                )}
                {defensiveScenario && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>vs Defense:</Text>
                    <Text style={styles.infoValue}>{defensiveScenario.formation_name} {defensiveScenario.coverage_name}</Text>
                  </View>
                )}
              </View>

              {/* Learning Analysis */}
              <View style={styles.learningBox}>
                <Text style={styles.learningTitle}>🧑‍🏫 Analysis</Text>
                <Text style={styles.learningText}>{playResult.explanation}</Text>
              </View>
            </View>

            {/* Right Panel - Action Buttons and Stats */}
            <View style={isLandscape ? styles.rightPanel : styles.fullPanel}>
              <Text style={styles.sectionTitleLarge}>Next Decision</Text>
              
              <TouchableOpacity 
                style={styles.nextScenarioButton}
                onPress={loadNewScenario}
              >
                <Text style={styles.nextScenarioButtonText}>🎲 New Scenario</Text>
                <Text style={styles.buttonSubtext}>Get another decision to make</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.homeButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.homeButtonText}>🏠 Back to Home</Text>
                <Text style={styles.buttonSubtext}>Main menu</Text>
              </TouchableOpacity>

              {/* Stats Display */}
              {snapAudibleStats.total_decisions > 0 && (
                <View style={styles.statsContainer}>
                  <View style={styles.statsHeader}>
                    <Text style={styles.statsTitle}>📊 Your Stats</Text>
                    <TouchableOpacity style={styles.resetStatsButton} onPress={resetStats}>
                      <Text style={styles.resetStatsText}>Reset</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{snapAudibleStats.total_decisions}</Text>
                      <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>
                        {Math.round((snapAudibleStats.correct_decisions / snapAudibleStats.total_decisions) * 100)}%
                      </Text>
                      <Text style={styles.statLabel}>Correct</Text>
                    </View>
                  </View>
                  
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{snapAudibleStats.snap_decisions}</Text>
                      <Text style={styles.statLabel}>Snaps</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{snapAudibleStats.audible_decisions}</Text>
                      <Text style={styles.statLabel}>Audibles</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main game screen - decision making view
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonHeader}>
          <Text style={styles.backButtonHeaderText}>← Home</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.titleLarge}>🏈 Snap or Audible</Text>
          {/* Difficulty indicator */}
          <View style={[styles.difficultyIndicator, { backgroundColor: getDifficultyLevel().color }]}>
            <Text style={styles.difficultyText}>
              {getDifficultyLevel().emoji} {getDifficultyLevel().name}
            </Text>
          </View>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')} 
            style={styles.headerActionButton}
          >
            <Text style={styles.headerActionButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={loadNewScenario} style={styles.headerActionButton}>
            <Text style={styles.headerActionButtonText}>🎲 New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.scrollContentContainer}>
        <View style={isLandscape ? styles.horizontalContent : styles.verticalContent}>
          
          {/* Left Panel - Defensive Information (same as main game mode) */}
          <View style={isLandscape ? styles.leftPanel : styles.fullPanel}>
            <Text style={styles.sectionTitleLarge}>🛡️ Defensive Scenario</Text>
            
            {/* Yards Needed Box (same as main game) */}
            <View style={styles.yardsNeededBox}>
              <Text style={styles.yardsNeededText}>🎯 NEED {minimumYards} YARDS</Text>
            </View>

            {/* Defensive Information Box (same structure as main game) */}
            <View style={styles.defenseInfoBox}>
              {/* Formation Name - show if enabled */}
              {visibilitySettings.formation_name && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Formation:</Text>
                  <Text style={styles.infoValue}>{defensiveScenario.formation_name}</Text>
                </View>
              )}
              
              {/* Personnel - show if enabled */}
              {visibilitySettings.personnel && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Personnel:</Text>
                  <Text style={styles.infoValue}>{defensiveScenario.personnel}</Text>
                </View>
              )}
              
              {/* Coverage Name - show if enabled */}
              {visibilitySettings.coverage_name && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Coverage:</Text>
                  <Text style={styles.infoValue}>{defensiveScenario.coverage_name}</Text>
                </View>
              )}
              
              {/* Coverage Type - show if enabled */}
              {visibilitySettings.coverage_type && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Coverage Type:</Text>
                  <Text style={styles.infoValue}>{defensiveScenario.coverage_type}</Text>
                </View>
              )}
              
              {/* Situation - always show */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Situation:</Text>
                <Text style={styles.infoValue}>
                  {defensiveScenario.down} & {defensiveScenario.distance} at {defensiveScenario.field_position}
                </Text>
              </View>
              
              {/* Blitz information - show if enabled */}
              {visibilitySettings.blitz_name && defensiveScenario.blitz_name && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Blitz:</Text>
                  <Text style={styles.infoValue}>{defensiveScenario.blitz_name}</Text>
                </View>
              )}
              
              {/* Number of rushers - show if enabled */}
              {visibilitySettings.rushers && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Rushers:</Text>
                  <Text style={styles.infoValue}>{defensiveScenario.rushers || 'Unknown'}</Text>
                </View>
              )}
              
              {/* Coverage adjustment - show if enabled */}
              {visibilitySettings.coverage_adjustment && defensiveScenario.coverage_adjustment && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Adjustment:</Text>
                  <Text style={styles.infoValue}>{defensiveScenario.coverage_adjustment}</Text>
                </View>
              )}
            </View>

            {/* SVG Field Visual (same as main game mode) */}
            {visibilitySettings.field_visual && defensiveScenario && (
              <View style={styles.fieldVisualBox}>
                <Text style={styles.fieldVisualTitle}>🏈 Defensive Formation</Text>
                
                <SVGFieldVisualizer 
                  formationName={defensiveScenario.formation_data?.formation_name?.replace(' Defense', '').toLowerCase() || 'base'}
                  yardsToGo={minimumYards}
                  coverageName={defensiveScenario.coverage_name || 'Base Coverage'}
                  showCoverage={false}
                  showBlitz={false}
                  onPlayerPress={handlePlayerPress}
                />
              </View>
            )}
          </View>

          {/* Right Panel - Pre-Selected Play and Decision Making */}
          <View style={isLandscape ? styles.rightPanel : styles.fullPanel}>
            <Text style={styles.sectionTitleLarge}>Your Play Call</Text>
            
            {/* Pre-selected offensive play display */}
            <View style={styles.offensiveInfo}>
              <Text style={styles.subsectionTitle}>Coach Called:</Text>
              {preSelectedPlay && (
                <View style={styles.playCallBox}>
                  <Text style={styles.playCallName}>{formatPlayInfo(preSelectedPlay).name}</Text>
                  <Text style={styles.playCallDetails}>
                    {formatPlayInfo(preSelectedPlay).formation} • {formatPlayInfo(preSelectedPlay).type} • {formatPlayInfo(preSelectedPlay).concept}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.instructionText}>
              Based on what the defense is showing, will this play work or should you change it?
            </Text>

            {/* Decision buttons */}
            <View style={styles.decisionButtons}>
              <TouchableOpacity 
                style={styles.snapButton}
                onPress={() => makeDecision('SNAP')}
              >
                <Text style={styles.snapButtonText}>SNAP</Text>
                <Text style={styles.snapButtonSubtext}>This play will work!</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.audibleButton}
                onPress={() => makeDecision('AUDIBLE')}
              >
                <Text style={styles.audibleButtonText}>AUDIBLE</Text>
                <Text style={styles.audibleButtonSubtext}>Change the play!</Text>
              </TouchableOpacity>
            </View>

            {/* Compact Stats Display */}
            {snapAudibleStats.total_decisions > 0 && (
              <View style={styles.statsContainerCompact}>
                <View style={styles.statsHeaderCompact}>
                  <Text style={styles.statsTitleCompact}>📊 Your Record</Text>
                  <TouchableOpacity style={styles.resetStatsButtonCompact} onPress={resetStats}>
                    <Text style={styles.resetStatsTextCompact}>Reset</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.statsRowCompact}>
                  <View style={styles.statItemCompact}>
                    <Text style={styles.statNumberCompact}>{snapAudibleStats.total_decisions}</Text>
                    <Text style={styles.statLabelCompact}>Decisions</Text>
                  </View>
                  
                  <View style={styles.statItemCompact}>
                    <Text style={styles.statNumberCompact}>
                      {snapAudibleStats.total_decisions > 0 ? 
                        Math.round((snapAudibleStats.correct_decisions / snapAudibleStats.total_decisions) * 100) : 0}%
                    </Text>
                    <Text style={styles.statLabelCompact}>Correct</Text>
                  </View>
                </View>
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

  // Header Bar
  headerBar: {
    backgroundColor: '#dc2626', // Red theme for Snap/Audible mode
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
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  difficultyIndicator: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
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
    gap: 8,
  },
  headerActionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  headerActionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  placeholder: {
    width: 50,
  },

  // Main scroll view
  mainScrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 10,
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

  // Section titles
  sectionTitleLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 20,
    textAlign: 'center',
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },

  // Yards needed box (same as main game mode)
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

  // Defense info box (same as main game mode)
  defenseInfoBox: {
    backgroundColor: '#f0f2f6',
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#1f4e79',
    marginBottom: 20,
  },

  // Field Visual Box (same as main game mode)
  fieldVisualBox: {
    backgroundColor: '#e8f5e8',
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#10b981',
    padding: 12,
  },
  fieldVisualTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },

  // Info displays
  offensiveInfo: {
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },

  // Play call box
  playCallBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
  },
  playCallName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 4,
  },
  playCallDetails: {
    fontSize: 14,
    color: '#6b7280',
  },

  // Instructions
  instructionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },

  // Decision buttons
  decisionButtons: {
    gap: 16,
    marginBottom: 24,
  },
  snapButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  snapButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  snapButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic',
  },
  audibleButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  audibleButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  audibleButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic',
  },

  // Results
  resultBox: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  correctBox: {
    backgroundColor: '#d4edda',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  incorrectBox: {
    backgroundColor: '#f8d7da',
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultChoice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  resultOutcome: {
    fontSize: 16,
    color: '#6b7280',
  },

  // Play details box
  playDetailsBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },

  // Learning box
  learningBox: {
    backgroundColor: '#ecfdf5',
    borderRadius: 10,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  learningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 8,
  },
  learningText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },

  // Action buttons
  nextScenarioButton: {
    backgroundColor: '#dc2626',
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
  nextScenarioButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  homeButton: {
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
  homeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },

  // Stats
  statsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  resetStatsButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  resetStatsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  // Compact stats
  statsContainerCompact: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  statsHeaderCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsTitleCompact: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  resetStatsButtonCompact: {
    backgroundColor: '#dc2626',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  resetStatsTextCompact: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  statsRowCompact: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItemCompact: {
    alignItems: 'center',
  },
  statNumberCompact: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  statLabelCompact: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 1,
  },
});