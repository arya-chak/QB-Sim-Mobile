import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
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

// Helper function to get formation emoji
const getFormationEmoji = (formationName, type) => {
  if (type === 'offensive') {
    const emojiMap = {
      'i-form': '🏃',
      'singleback': '⚔️',
      'shotgun': '⚡',
      'trips': '📐',
      'bunch': '🎯',
      'empty': '🌊',
      'goal line': '💪'
    };
    return emojiMap[formationName?.toLowerCase()] || '🏈';
  } else {
    const emojiMap = {
      '4-3': '🛡️',
      '3-4': '⚔️',
      '4-4': '⚖️',
      '5-2': '💪',
      'nickel': '🎯',
      'dime': '💎',
      '46': '🔥'
    };
    return emojiMap[formationName?.toLowerCase()] || '🛡️';
  }
};

// Formation Selection Component
const FormationSelector = ({ 
  type, 
  formations, 
  selectedFormation, 
  onFormationChange, 
  loading 
}) => {
  const typeConfig = {
    offensive: {
      emoji: '🏈',
      title: 'Offensive Formation',
      color: '#3b82f6',
      emptyText: 'Select an offensive formation to analyze'
    },
    defensive: {
      emoji: '🛡️',
      title: 'Defensive Formation',
      color: '#1f4e79',
      emptyText: 'Select a defensive formation to analyze'
    }
  };

  const config = typeConfig[type];

  if (loading) {
    return (
      <View style={[styles.selectorContainer, { borderColor: config.color }]}>
        <Text style={[styles.selectorTitle, { color: config.color }]}>
          {config.emoji} {config.title}
        </Text>
        <ActivityIndicator size="small" color={config.color} />
        <Text style={styles.loadingText}>Loading formations...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.selectorContainer, { borderColor: config.color }]}>
      <Text style={[styles.selectorTitle, { color: config.color }]}>
        {config.emoji} {config.title}
      </Text>
      
      {formations.length === 0 ? (
        <Text style={styles.emptyText}>No formations available</Text>
      ) : (
        <ScrollView style={styles.formationList} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.formationOption,
              !selectedFormation && styles.formationOptionSelected
            ]}
            onPress={() => onFormationChange(null)}
          >
            <Text style={[
              styles.formationOptionText,
              !selectedFormation && styles.formationOptionTextSelected
            ]}>
              {config.emptyText}
            </Text>
          </TouchableOpacity>
          
          {formations.map((formation) => (
            <TouchableOpacity
              key={formation.key}
              style={[
                styles.formationOption,
                selectedFormation?.key === formation.key && styles.formationOptionSelected
              ]}
              onPress={() => onFormationChange(formation)}
            >
              <Text style={[
                styles.formationOptionText,
                selectedFormation?.key === formation.key && styles.formationOptionTextSelected
              ]}>
                {formation.name}
              </Text>
              <Text style={styles.formationOptionSubtext}>
                {formation.personnel || `${formation.total_coverages} coverages`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

// Formation Details Component
const FormationDetails = ({ formation, type, isExpanded, onToggle }) => {
  if (!formation) {
    return (
      <View style={styles.formationDetailsContainer}>
        <Text style={styles.emptyStateText}>
          {type === 'offensive' ? 
            '🏈 Select an offensive formation to see details' : 
            '🛡️ Select a defensive formation to see details'
          }
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.formationDetailsContainer}>
      {/* Formation Header */}
      <View style={styles.formationDetailsHeader}>
        <Text style={styles.formationEmoji}>
          {getFormationEmoji(formation.name, type)}
        </Text>
        <View style={styles.formationDetailsTitle}>
          <Text style={styles.formationDetailsName} numberOfLines={2}>
            {formation.name}
          </Text>
          <Text style={styles.formationDetailsPersonnel} numberOfLines={1}>
            {formation.personnel}
          </Text>
        </View>
        <TouchableOpacity onPress={onToggle} style={styles.expandButton}>
          <Text style={styles.expandButtonText}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Formation Description */}
      <View style={styles.formationDescriptionContainer}>
        <Text 
          style={styles.formationDescription} 
          numberOfLines={isExpanded ? undefined : 3}
        >
          {formation.description}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          {type === 'offensive' ? (
            <>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{formation.total_plays || 0}</Text>
                <Text style={styles.statLabel}>Total Plays</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#3b82f6' }]}>
                  {formation.total_passing_plays || 0}
                </Text>
                <Text style={styles.statLabel}>Passing</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#10b981' }]}>
                  {formation.total_running_plays || 0}
                </Text>
                <Text style={styles.statLabel}>Running</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{formation.total_coverages || 0}</Text>
                <Text style={styles.statLabel}>Coverages</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#ef4444' }]}>
                  {formation.total_blitz_packages || 0}
                </Text>
                <Text style={styles.statLabel}>Blitz Schemes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#8b5cf6' }]}>
                  {formation.coverages?.filter(c => c.coverage_type === 'zone').length || 0}
                </Text>
                <Text style={styles.statLabel}>Zone Coverages</Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Always show first few key strengths and weaknesses */}
      {!isExpanded && ((type === 'offensive' && formation.formation_strengths) || 
        (type === 'defensive' && formation.base_strengths)) && (
        <View style={styles.quickStrengthsContainer}>
          <Text style={styles.quickStrengthsTitle}>💪 Key Strengths</Text>
          {(type === 'offensive' ? 
            formation.formation_strengths?.slice(0, 4) : 
            formation.base_strengths?.slice(0, 4)
          )?.map((strength, index) => (
            <Text key={index} style={styles.quickStrengthsItem}>
              • {strength.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          ))}
        </View>
      )}

      {!isExpanded && ((type === 'offensive' && formation.formation_weaknesses) || 
        (type === 'defensive' && formation.base_weaknesses)) && (
        <View style={styles.quickWeaknessesContainer}>
          <Text style={styles.quickWeaknessesTitle}>⚠️ Key Weaknesses</Text>
          {(type === 'offensive' ? 
            formation.formation_weaknesses?.slice(0, 4) : 
            formation.base_weaknesses?.slice(0, 4)
          )?.map((weakness, index) => (
            <Text key={index} style={styles.quickWeaknessesItem}>
              • {weakness.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          ))}
        </View>
      )}

      {/* Coverage Packages for Defensive Formations - SHOW ALL COVERAGES */}
      {type === 'defensive' && formation.coverages && formation.coverages.length > 0 && (
        <View style={styles.coveragePackagesContainer}>
          <Text style={styles.coveragePackagesTitle}>
            🛡️ Coverage Packages ({formation.coverages.length})
          </Text>
          <Text style={styles.coveragePackagesSubtitle}>
            All available coverage schemes for this formation
          </Text>
          
          <View style={styles.coveragesList}>
            {/* Show ALL coverages, not just first 3 */}
            {formation.coverages.map((coverage, index) => (
              <View key={coverage.key} style={styles.coverageItem}>
                <View style={styles.coverageHeader}>
                  <View style={styles.coverageMainInfo}>
                    <Text style={styles.coverageName}>
                      {coverage.name}
                    </Text>
                    <Text style={styles.coverageType}>
                      {coverage.coverage_type?.toUpperCase()} COVERAGE
                    </Text>
                  </View>
                  <View style={styles.coverageStats}>
                    <Text style={styles.blitzCount}>
                      {coverage.blitz_packages?.length || 0}
                    </Text>
                    <Text style={styles.blitzLabel}>blitz packages</Text>
                  </View>
                </View>
                
                {/* Show brief description if available */}
                {coverage.description && (
                  <Text style={styles.coverageDescription} numberOfLines={2}>
                    {coverage.description}
                  </Text>
                )}
                
                {/* Show optimal situations as tags */}
                {coverage.optimal_situations && coverage.optimal_situations.length > 0 && (
                  <View style={styles.situationTagsContainer}>
                    <Text style={styles.situationTagsTitle}>Best for:</Text>
                    <View style={styles.situationTags}>
                      {coverage.optimal_situations.slice(0, 3).map((situation, tagIndex) => (
                        <View key={tagIndex} style={styles.situationTag}>
                          <Text style={styles.situationTagText}>
                            {situation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <View style={styles.expandedDetails}>
          {/* Strengths */}
          {((type === 'offensive' && formation.formation_strengths) || 
            (type === 'defensive' && formation.base_strengths)) && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>💪 All Formation Strengths</Text>
              <View style={styles.detailItemsContainer}>
                {(type === 'offensive' ? 
                  formation.formation_strengths : 
                  formation.base_strengths
                )?.map((strength, index) => (
                  <Text key={index} style={styles.detailItem}>
                    • {strength.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Weaknesses */}
          {((type === 'offensive' && formation.formation_weaknesses) || 
            (type === 'defensive' && formation.base_weaknesses)) && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>⚠️ All Formation Weaknesses</Text>
              <View style={styles.detailItemsContainer}>
                {(type === 'offensive' ? 
                  formation.formation_weaknesses : 
                  formation.base_weaknesses
                )?.map((weakness, index) => (
                  <Text key={index} style={styles.detailItem}>
                    • {weakness.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Optimal Situations for Defensive Formations */}
          {type === 'defensive' && formation.optimal_situations && formation.optimal_situations.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>🎯 Optimal Situations</Text>
              <View style={styles.optimalSituationsGrid}>
                {formation.optimal_situations.map((situation, index) => (
                  <View key={index} style={styles.optimalSituationTag}>
                    <Text style={styles.optimalSituationText}>
                      {situation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// Matchup Analysis Component
const MatchupAnalysis = ({ offensiveFormation, defensiveFormation }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (offensiveFormation && defensiveFormation) {
      generateMatchupAnalysis();
    }
  }, [offensiveFormation, defensiveFormation]);

  const generateMatchupAnalysis = () => {
    // Simple analysis logic - in a real app you might call an API
    const analysis = {
      offensiveAdvantages: [],
      defensiveAdvantages: [],
      keyMatchups: [],
      recommendations: []
    };

    // Find overlapping concepts between offensive strengths and defensive weaknesses
    const offStrengths = offensiveFormation?.formation_strengths || [];
    const defWeaknesses = defensiveFormation?.base_weaknesses || [];
    
    offStrengths.forEach(strength => {
      defWeaknesses.forEach(weakness => {
        if (strength.includes('pass') && weakness.includes('pass')) {
          analysis.offensiveAdvantages.push('Passing game advantage');
        }
        if (strength.includes('run') && weakness.includes('run')) {
          analysis.offensiveAdvantages.push('Running game advantage');
        }
      });
    });

    // Find defensive advantages
    const defStrengths = defensiveFormation?.base_strengths || [];
    const offWeaknesses = offensiveFormation?.formation_weaknesses || [];
    
    defStrengths.forEach(strength => {
      offWeaknesses.forEach(weakness => {
        if (strength.includes('coverage') && weakness.includes('pass')) {
          analysis.defensiveAdvantages.push('Coverage advantage');
        }
      });
    });

    setAnalysisData(analysis);
  };

  if (!offensiveFormation || !defensiveFormation) {
    return (
      <View style={styles.analysisContainer}>
        <Text style={styles.analysisTitle}>⚖️ Matchup Analysis</Text>
        <Text style={styles.analysisEmptyText}>
          Select both offensive and defensive formations to see matchup analysis
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.analysisContainer}>
      <Text style={styles.analysisTitle}>⚖️ Matchup Analysis</Text>
      <Text style={styles.analysisSubtitle}>
        {offensiveFormation.name} vs {defensiveFormation.name}
      </Text>

      {/* Quick Comparison */}
      <View style={styles.quickComparison}>
        <View style={styles.comparisonSide}>
          <Text style={styles.comparisonTitle}>🏈 Offensive Edge</Text>
          <Text style={styles.comparisonStat}>
            {offensiveFormation.total_plays || 0} Total Plays
          </Text>
          <Text style={styles.comparisonNote}>
            More play variety = unpredictability
          </Text>
        </View>
        
        <View style={styles.comparisonVs}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        
        <View style={styles.comparisonSide}>
          <Text style={styles.comparisonTitle}>🛡️ Defensive Edge</Text>
          <Text style={styles.comparisonStat}>
            {defensiveFormation.total_blitz_packages || 0} Blitz Schemes
          </Text>
          <Text style={styles.comparisonNote}>
            More schemes = adaptability
          </Text>
        </View>
      </View>

      {/* Tactical Insights */}
      <View style={styles.tacticalInsights}>
        <Text style={styles.insightsTitle}>🎯 Tactical Insights</Text>
        
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>💡 Key Considerations</Text>
          <Text style={styles.insightText}>
            Study how the offensive formation's strengths match up against the defensive formation's coverage packages. Look for overlaps between what the offense does well and what the defense struggles against.
          </Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>🔍 What to Watch</Text>
          <Text style={styles.insightText}>
            Personnel packages determine initial advantages. The {offensiveFormation.personnel} offense vs {defensiveFormation.personnel} defense creates specific matchup scenarios that favor different play types.
          </Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>⚔️ Strategic Approach</Text>
          <Text style={styles.insightText}>
            Use the detailed formation libraries to dive deeper into specific plays that exploit defensive weaknesses, or coverage packages that neutralize offensive strengths.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function FormationComparisonScreen({ navigation }) {
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';

  const [offensiveFormations, setOffensiveFormations] = useState([]);
  const [defensiveFormations, setDefensiveFormations] = useState([]);
  const [selectedOffensive, setSelectedOffensive] = useState(null);
  const [selectedDefensive, setSelectedDefensive] = useState(null);
  const [offensiveDetails, setOffensiveDetails] = useState(null);
  const [defensiveDetails, setDefensiveDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedOffensive, setExpandedOffensive] = useState(false);
  const [expandedDefensive, setExpandedDefensive] = useState(false);

  useEffect(() => {
    loadFormations();
  }, []);

  useEffect(() => {
    if (selectedOffensive) {
      loadOffensiveDetails(selectedOffensive.key);
    } else {
      setOffensiveDetails(null);
    }
  }, [selectedOffensive]);

  useEffect(() => {
    if (selectedDefensive) {
      loadDefensiveDetails(selectedDefensive.key);
    } else {
      setDefensiveDetails(null);
    }
  }, [selectedDefensive]);

  const loadFormations = async () => {
    try {
      setLoading(true);
      const [offensiveData, defensiveData] = await Promise.all([
        ApiService.getLibraryOffensiveFormations(),
        ApiService.getLibraryDefensiveFormations()
      ]);
      
      setOffensiveFormations(offensiveData.formations);
      setDefensiveFormations(defensiveData.formations);
    } catch (error) {
      console.error('Error loading formations:', error);
      Alert.alert(
        'Error',
        'Failed to load formations. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const loadOffensiveDetails = async (formationKey) => {
    try {
        const data = await ApiService.getOffensiveFormationDetails(formationKey);
    
        // Add total_plays calculation for consistency with defensive formations
        const total_plays = (data.passing_plays?.length || 0) + (data.running_plays?.length || 0);
    
        const formationWithTotals = {
            ...data,
            total_plays: total_plays,
            total_passing_plays: data.passing_plays?.length || 0,
            total_running_plays: data.running_plays?.length || 0
        };
    
        setOffensiveDetails(formationWithTotals);
    } catch (error) {
        console.error('Error loading offensive details:', error);
        Alert.alert(
        'Error',
        'Failed to load offensive formation details. Please try again.'
        );
    }
  };

  const loadDefensiveDetails = async (formationKey) => {
    try {
        const data = await ApiService.getDefensiveFormationDetails(formationKey);
    
        // Calculate total_blitz_packages correctly from the detailed data
        const total_blitz_packages = data.coverages?.reduce((sum, coverage) => {
        return sum + (coverage.blitz_packages?.length || 0);
        }, 0) || 0;
    
        // Add the calculated total to the defensive details
        const formationWithTotals = {
            ...data,
            total_blitz_packages: total_blitz_packages
        };
    
        setDefensiveDetails(formationWithTotals);
    } catch (error) {
        console.error('Error loading defensive details:', error);
        Alert.alert(
        'Error',
        'Failed to load defensive formation details. Please try again.'
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⚖️ Formation Comparison</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Formation Selectors */}
        <View style={[
          styles.selectorsContainer,
          isLandscape && styles.selectorsContainerLandscape
        ]}>
          <FormationSelector
            type="offensive"
            formations={offensiveFormations}
            selectedFormation={selectedOffensive}
            onFormationChange={setSelectedOffensive}
            loading={loading}
          />
          
          <FormationSelector
            type="defensive"
            formations={defensiveFormations}
            selectedFormation={selectedDefensive}
            onFormationChange={setSelectedDefensive}
            loading={loading}
          />
        </View>

        {/* Field Visualization */}
        {selectedDefensive && (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldTitle}>🏈 Defensive Formation Visual</Text>
            <View style={styles.fieldVisualWrapper}>
              <SVGFieldVisualizer 
                formationName={selectedDefensive.key}
                yardsToGo={10}
                coverageName="Base Coverage"
                showCoverage={false}
                showBlitz={false}
                onPlayerPress={() => {}}
              />
            </View>
            <Text style={styles.fieldSubtitle}>
              {selectedDefensive.name} - Clean pre-snap view
            </Text>
          </View>
        )}

        {/* Formation Details */}
        <View style={[
          styles.detailsContainer,
          isLandscape && styles.detailsContainerLandscape
        ]}>
          <FormationDetails
            formation={offensiveDetails}
            type="offensive"
            isExpanded={expandedOffensive}
            onToggle={() => setExpandedOffensive(!expandedOffensive)}
          />
          
          <FormationDetails
            formation={defensiveDetails}
            type="defensive"
            isExpanded={expandedDefensive}
            onToggle={() => setExpandedDefensive(!expandedDefensive)}
          />
        </View>

        {/* Matchup Analysis */}
        <MatchupAnalysis
          offensiveFormation={offensiveDetails}
          defensiveFormation={defensiveDetails}
        />

        {/* Action Buttons */}
        {(selectedOffensive || selectedDefensive) && (
          <View style={styles.actionButtons}>
            {selectedOffensive && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
                onPress={() => navigation.navigate('OffensiveFormationDetail', {
                  formationKey: selectedOffensive.key,
                  formationName: selectedOffensive.name
                })}
              >
                <Text style={styles.actionButtonText}>
                  🏈 Explore {selectedOffensive.name}
                </Text>
              </TouchableOpacity>
            )}
            
            {selectedDefensive && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#1f4e79' }]}
                onPress={() => navigation.navigate('DefensiveFormationDetail', {
                  formationKey: selectedDefensive.key,
                  formationName: selectedDefensive.name
                })}
              >
                <Text style={styles.actionButtonText}>
                  🛡️ Explore {selectedDefensive.name}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Compare formations to understand strategic matchups and identify tactical advantages
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },

  // Formation Selectors
  selectorsContainer: {
    marginBottom: 20,
  },
  selectorsContainerLandscape: {
    flexDirection: 'row',
    gap: 20,
  },
  selectorContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  formationList: {
    maxHeight: 200,
  },
  formationOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  formationOptionSelected: {
    backgroundColor: '#f3f4f6',
  },
  formationOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  formationOptionTextSelected: {
    color: '#1f4e79',
    fontWeight: '600',
  },
  formationOptionSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  // Field Visualization
  fieldContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 12,
  },
  fieldVisualWrapper: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  fieldSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Formation Details
  detailsContainer: {
    marginTop: 20,
  },
  detailsContainerLandscape: {
    flexDirection: 'row',
    gap: 20,
    // Ensure both sides get equal space
    flex: 1,
  },
  formationDetailsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: '100%',
    flex: 1,
    minHeight: 0,
  },
  formationDescriptionContainer: {
    marginBottom: 12,
    flexShrink: 1,
  },
  noSelectionText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 16,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  formationDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  formationEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  formationDetailsTitle: {
    flex: 1,
    // Prevent title from overflowing
    minWidth: 0,
  },
  formationDetailsName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4e79',
    // Allow text to wrap if needed
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  formationDetailsPersonnel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    // Prevent personnel text from overflowing
    flexShrink: 1,
  },
  expandButton: {
    padding: 8,
  },
  expandButtonText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  formationDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  quickStrengthsContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  quickStrengthsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 6,
  },
  quickStrengthsItem: {
    fontSize: 11,
    color: '#0369a1',
    lineHeight: 16,
    marginBottom: 2,
  },
  quickWeaknessesContainer: {
    backgroundColor: '#fef3f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  quickWeaknessesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 6,
  },
  quickWeaknessesItem: {
    fontSize: 11,
    color: '#dc2626',
    lineHeight: 16,
    marginBottom: 2,
  },
  statsContainer: {
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  expandedDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
    marginTop: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 8,
  },
  detailItemsContainer: {
    flexDirection: 'column',
    gap: 4,
  },
  detailItem: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    flexWrap: 'wrap',
  },
  optimalSituationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optimalSituationTag: {
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  optimalSituationText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '500',
  },
  coveragePackagesContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  coveragePackagesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 4,
  },
  coveragePackagesSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  coveragesList: {
    gap: 10,
  },
  coverageItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#1f4e79',
  },
  coverageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  coverageMainInfo: {
    flex: 1,
  },
  coverageName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 3,
  },
  coverageType: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  coverageStats: {
    alignItems: 'center',
    marginLeft: 12,
  },
  blitzCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
    textAlign: 'center',
  },
  blitzLabel: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
  coverageDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  moreText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 40,
  },
  situationTagsContainer: {
    marginTop: 6,
  },
  situationTagsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  situationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  situationTag: {
    backgroundColor: '#ecfdf5',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  situationTagText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '500',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 60,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4e79',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  // Matchup Analysis
  analysisContainer: {
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
  analysisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 4,
  },
  analysisSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  analysisEmptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 16,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  quickComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  comparisonSide: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 4,
  },
  comparisonStat: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  comparisonNote: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
  },
  comparisonVs: {
    paddingHorizontal: 16,
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  tacticalInsights: {
    marginTop: 8,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 12,
  },
  insightCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 11,
    color: '#6b7280',
    lineHeight: 16,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Footer
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});