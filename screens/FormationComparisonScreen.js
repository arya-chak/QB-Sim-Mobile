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
  const getFormationEmoji = (formationName, type) => {
    if (type === 'offensive') {
      const emojiMap = {
        'I-Formation': '🏃',
        'Singleback': '⚔️',
        'Shotgun': '⚡',
        'Trips': '📐',
        'Bunch': '🎯',
        'Empty': '🌊',
        'Goal Line': '💪'
      };
      return emojiMap[formationName] || '🏈';
    } else {
      const emojiMap = {
        '4-3 Defense': '🛡️',
        '3-4 Defense': '⚔️',
        '5-2 Defense': '🏰',
        '4-4 Defense': '⚖️',
        '46 Defense': '💥',
        'Nickel Defense': '🔺',
        'Dime Defense': '💎'
      };
      return emojiMap[formationName] || '🛡️';
    }
  };

  if (!formation) {
    return (
      <View style={styles.formationDetailsContainer}>
        <Text style={styles.noSelectionText}>
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
          <Text style={styles.formationDetailsName}>{formation.name}</Text>
          <Text style={styles.formationDetailsPersonnel}>
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
      <Text style={styles.formationDescription}>{formation.description}</Text>

      {/* Expanded Details */}
      {isExpanded && (
        <View style={styles.expandedDetails}>
          {/* Strengths */}
          {((type === 'offensive' && formation.formation_strengths) || 
            (type === 'defensive' && formation.base_strengths)) && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>💪 Key Strengths</Text>
              {(type === 'offensive' ? 
                formation.formation_strengths?.slice(0, 4) : 
                formation.base_strengths?.slice(0, 4)
              )?.map((strength, index) => (
                <Text key={index} style={styles.detailItem}>
                  • {strength.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              ))}
            </View>
          )}

          {/* Weaknesses */}
          {((type === 'offensive' && formation.formation_weaknesses) || 
            (type === 'defensive' && formation.base_weaknesses)) && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>⚠️ Key Weaknesses</Text>
              {(type === 'offensive' ? 
                formation.formation_weaknesses?.slice(0, 4) : 
                formation.base_weaknesses?.slice(0, 4)
              )?.map((weakness, index) => (
                <Text key={index} style={styles.detailItem}>
                  • {weakness.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              ))}
            </View>
          )}

          {/* Optimal Situations */}
          {formation.optimal_situations && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>🎯 Optimal Situations</Text>
              <View style={styles.situationTags}>
                {formation.optimal_situations.slice(0, 6).map((situation, index) => (
                  <View key={index} style={styles.situationTag}>
                    <Text style={styles.situationTagText}>
                      {situation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Additional Stats */}
          <View style={styles.statsSection}>
            {type === 'offensive' ? (
              <>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formation.total_plays || 0}</Text>
                  <Text style={styles.statLabel}>Total Plays</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: '#3b82f6' }]}>
                    {formation.passing_plays?.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>Passing</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: '#10b981' }]}>
                    {formation.running_plays?.length || 0}
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
      const details = await ApiService.getOffensiveFormationDetails(formationKey);
      setOffensiveDetails(details);
    } catch (error) {
      console.error('Error loading offensive details:', error);
    }
  };

  const loadDefensiveDetails = async (formationKey) => {
    try {
      const details = await ApiService.getDefensiveFormationDetails(formationKey);
      setDefensiveDetails(details);
    } catch (error) {
      console.error('Error loading defensive details:', error);
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
    marginBottom: 20,
  },
  detailsContainerLandscape: {
    flexDirection: 'row',
    gap: 20,
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
  },
  formationDetailsName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4e79',
  },
  formationDetailsPersonnel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
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
    marginBottom: 12,
  },
  expandedDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  detailSection: {
    marginBottom: 12,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 6,
  },
  detailItem: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 2,
  },
  situationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  situationTag: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  situationTagText: {
    fontSize: 10,
    color: '#4b5563',
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
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4e79',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
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