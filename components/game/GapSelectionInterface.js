import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { GapScenarioService } from '../../services/GapScenarioService';

const GapSelectionInterface = ({ 
  scenarioData = null,
  onGapSelected = null,
  onAnalysisComplete = null,
  disabled = false,
  showResult = false 
}) => {
  const [selectedGap, setSelectedGap] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Gap options in logical order
  const gapOptions = [
    { gap: 'A', side: 'weak', label: 'A-Gap Weak', position: 'inside_weak' },
    { gap: 'A', side: 'strong', label: 'A-Gap Strong', position: 'inside_strong' },
    { gap: 'B', side: 'weak', label: 'B-Gap Weak', position: 'guard_weak' },
    { gap: 'B', side: 'strong', label: 'B-Gap Strong', position: 'guard_strong' },
    { gap: 'C', side: 'weak', label: 'C-Gap Weak', position: 'tackle_weak' },
    { gap: 'C', side: 'strong', label: 'C-Gap Strong', position: 'tackle_strong' },
    { gap: 'D', side: 'weak', label: 'D-Gap Weak', position: 'outside_weak' },
    { gap: 'D', side: 'strong', label: 'D-Gap Strong', position: 'outside_strong' }
  ];

  const handleGapSelection = (gapOption) => {
    if (disabled || analyzing) return;
    
    const gapKey = `${gapOption.gap}_gap_${gapOption.side}`;
    setSelectedGap(gapKey);
    
    // Notify parent component
    if (onGapSelected) {
      onGapSelected(gapKey, gapOption);
    }
  };

  const analyzeSelection = async () => {
    if (!selectedGap || !scenarioData || analyzing) return;
    
    try {
      setAnalyzing(true);
      
      // Call the gap analysis service
      const result = await GapScenarioService.analyzeGapChoice(scenarioData.id, selectedGap);
      
      setAnalysisResult(result);
      
      // Notify parent component with results
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
      
    } catch (error) {
      console.error('Error analyzing gap choice:', error);
      Alert.alert('Analysis Error', 'Failed to analyze your gap choice. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetSelection = () => {
    setSelectedGap(null);
    setAnalysisResult(null);
  };

  // Get button style based on gap status
  const getGapButtonStyle = (gapOption) => {
    const gapKey = `${gapOption.gap}_gap_${gapOption.side}`;
    const isSelected = selectedGap === gapKey;
    
    if (!scenarioData || !showResult) {
      // Before analysis - show selection state
      return isSelected ? styles.gapButtonSelected : styles.gapButton;
    }

    // After analysis - show correctness
    const gapAnalysis = scenarioData.defense?.gap_analysis?.[gapKey];
    const isOptimal = scenarioData.defense?.optimal_gap === gapKey;
    
    if (isOptimal && isSelected) {
      return styles.gapButtonCorrect; // Green - correct choice
    } else if (isSelected && !isOptimal) {
      return styles.gapButtonIncorrect; // Red - wrong choice
    } else if (isOptimal && !isSelected) {
      return styles.gapButtonOptimal; // Gold - should have chosen this
    } else {
      return styles.gapButton; // Gray - not selected
    }
  };

  // Get button text color
  const getGapButtonTextStyle = (gapOption) => {
    const gapKey = `${gapOption.gap}_gap_${gapOption.side}`;
    const isSelected = selectedGap === gapKey;
    
    if (showResult) {
      return styles.gapButtonTextResult; // Always white when showing results
    }
    
    return isSelected ? styles.gapButtonTextSelected : styles.gapButtonText;
  };

  // Get success probability for display
  const getSuccessProbability = (gapOption) => {
    if (!scenarioData?.defense?.gap_analysis) return null;
    
    const gapKey = `${gapOption.gap}_gap_${gapOption.side}`;
    const gapAnalysis = scenarioData.defense.gap_analysis[gapKey];
    
    return gapAnalysis?.success_probability || 0;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Choose Your Running Gap</Text>
        {scenarioData && (
          <Text style={styles.subtitle}>
            Analyze the {scenarioData.defense?.formation} and find the best option
          </Text>
        )}
      </View>

      {/* Gap Selection Grid */}
      <View style={styles.gapGrid}>
        <View style={styles.gapRow}>
          <Text style={styles.sideLabel}>WEAK SIDE</Text>
          <Text style={styles.sideLabel}>STRONG SIDE</Text>
        </View>
        
        {/* A-Gaps */}
        <View style={styles.gapRow}>
          <TouchableOpacity 
            style={getGapButtonStyle(gapOptions[0])}
            onPress={() => handleGapSelection(gapOptions[0])}
            disabled={disabled || analyzing}
          >
            <Text style={getGapButtonTextStyle(gapOptions[0])}>
              A-Gap
            </Text>
            {showResult && (
              <Text style={styles.probabilityText}>
                {getSuccessProbability(gapOptions[0])}%
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={getGapButtonStyle(gapOptions[1])}
            onPress={() => handleGapSelection(gapOptions[1])}
            disabled={disabled || analyzing}
          >
            <Text style={getGapButtonTextStyle(gapOptions[1])}>
              A-Gap
            </Text>
            {showResult && (
              <Text style={styles.probabilityText}>
                {getSuccessProbability(gapOptions[1])}%
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* B-Gaps */}
        <View style={styles.gapRow}>
          <TouchableOpacity 
            style={getGapButtonStyle(gapOptions[2])}
            onPress={() => handleGapSelection(gapOptions[2])}
            disabled={disabled || analyzing}
          >
            <Text style={getGapButtonTextStyle(gapOptions[2])}>
              B-Gap
            </Text>
            {showResult && (
              <Text style={styles.probabilityText}>
                {getSuccessProbability(gapOptions[2])}%
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={getGapButtonStyle(gapOptions[3])}
            onPress={() => handleGapSelection(gapOptions[3])}
            disabled={disabled || analyzing}
          >
            <Text style={getGapButtonTextStyle(gapOptions[3])}>
              B-Gap
            </Text>
            {showResult && (
              <Text style={styles.probabilityText}>
                {getSuccessProbability(gapOptions[3])}%
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* C-Gaps */}
        <View style={styles.gapRow}>
          <TouchableOpacity 
            style={getGapButtonStyle(gapOptions[4])}
            onPress={() => handleGapSelection(gapOptions[4])}
            disabled={disabled || analyzing}
          >
            <Text style={getGapButtonTextStyle(gapOptions[4])}>
              C-Gap
            </Text>
            {showResult && (
              <Text style={styles.probabilityText}>
                {getSuccessProbability(gapOptions[4])}%
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={getGapButtonStyle(gapOptions[5])}
            onPress={() => handleGapSelection(gapOptions[5])}
            disabled={disabled || analyzing}
          >
            <Text style={getGapButtonTextStyle(gapOptions[5])}>
              C-Gap
            </Text>
            {showResult && (
              <Text style={styles.probabilityText}>
                {getSuccessProbability(gapOptions[5])}%
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* D-Gaps */}
        <View style={styles.gapRow}>
          <TouchableOpacity 
            style={getGapButtonStyle(gapOptions[6])}
            onPress={() => handleGapSelection(gapOptions[6])}
            disabled={disabled || analyzing}
          >
            <Text style={getGapButtonTextStyle(gapOptions[6])}>
              D-Gap
            </Text>
            {showResult && (
              <Text style={styles.probabilityText}>
                {getSuccessProbability(gapOptions[6])}%
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={getGapButtonStyle(gapOptions[7])}
            onPress={() => handleGapSelection(gapOptions[7])}
            disabled={disabled || analyzing}
          >
            <Text style={getGapButtonTextStyle(gapOptions[7])}>
              D-Gap
            </Text>
            {showResult && (
              <Text style={styles.probabilityText}>
                {getSuccessProbability(gapOptions[7])}%
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      {selectedGap && !showResult && (
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={analyzing ? styles.analyzeButtonDisabled : styles.analyzeButton}
            onPress={analyzeSelection}
            disabled={analyzing}
          >
            <Text style={styles.analyzeButtonText}>
              {analyzing ? '🔄 Analyzing...' : '🧠 Analyze My Choice'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetSelection}
            disabled={analyzing}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Analysis Result */}
      {showResult && analysisResult && (
        <View style={styles.resultContainer}>
          <View style={[
            styles.resultBox, 
            analysisResult.is_correct ? styles.resultBoxCorrect : styles.resultBoxIncorrect
          ]}>
            <Text style={styles.resultTitle}>
              {analysisResult.is_correct ? '🎯 Excellent Read!' : '❌ Consider This...'}
            </Text>
            <Text style={styles.resultText}>
              {analysisResult.analysis}
            </Text>
            {analysisResult.optimal_gap !== selectedGap && (
              <Text style={styles.optimalText}>
                💡 Optimal choice: {analysisResult.optimal_gap?.replace('_', ' ').toUpperCase()}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Instructions */}
      {!selectedGap && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>📋 How to Choose:</Text>
          <Text style={styles.instructionsText}>• Study the defensive front 7 alignment</Text>
          <Text style={styles.instructionsText}>• Look for gaps with fewer defenders</Text>
          <Text style={styles.instructionsText}>• Consider the blocking scheme advantages</Text>
          <Text style={styles.instructionsText}>• Remember: Weak side = away from tight end</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  gapGrid: {
    marginBottom: 20,
  },
  gapRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    alignItems: 'center',
  },
  sideLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  gapButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  gapButtonSelected: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1d4ed8',
  },
  gapButtonCorrect: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#059669',
  },
  gapButtonIncorrect: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  gapButtonOptimal: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d97706',
  },
  gapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  gapButtonTextSelected: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  gapButtonTextResult: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  probabilityText: {
    fontSize: 10,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 2,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  analyzeButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  analyzeButtonDisabled: {
    backgroundColor: '#6b7280',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 16,
  },
  resultBox: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  resultBoxCorrect: {
    backgroundColor: '#d1fae5',
    borderLeftColor: '#10b981',
  },
  resultBoxIncorrect: {
    backgroundColor: '#fee2e2',
    borderLeftColor: '#ef4444',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  resultText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  optimalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  instructionsContainer: {
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: '#78350f',
    marginBottom: 2,
  },
});

export default GapSelectionInterface;