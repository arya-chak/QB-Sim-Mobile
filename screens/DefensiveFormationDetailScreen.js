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

// Blitz Package Card Component
const BlitzPackageCard = ({ blitzPackage, isExpanded, onToggle }) => {
  const getRusherColor = (rushers) => {
    if (rushers >= 6) return '#ef4444'; // Red - Heavy pressure
    if (rushers === 5) return '#f59e0b'; // Orange - Moderate pressure
    return '#10b981'; // Green - Base rush
  };

  return (
    <View style={styles.blitzCard}>
      <TouchableOpacity onPress={onToggle} style={styles.blitzCardHeader}>
        <View style={styles.blitzCardTitle}>
          <Text style={styles.blitzIcon}>🔥</Text>
          <View style={styles.blitzTitleContainer}>
            <Text style={styles.blitzName}>{blitzPackage.name}</Text>
            <Text style={styles.blitzDetails}>
              {blitzPackage.blitzer.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} • {blitzPackage.rushers} Rushers
            </Text>
          </View>
        </View>
        <View style={[
          styles.rusherBadge,
          { backgroundColor: getRusherColor(blitzPackage.rushers) }
        ]}>
          <Text style={styles.rusherText}>{blitzPackage.rushers}</Text>
        </View>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.blitzCardContent}>
          {/* Coverage Adjustment */}
          {blitzPackage.coverage_adjustment && (
            <View style={styles.adjustmentSection}>
              <Text style={styles.adjustmentTitle}>🔄 Coverage Adjustment</Text>
              <Text style={styles.adjustmentText}>
                {blitzPackage.coverage_adjustment.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
          )}

          {/* Tactical Analysis Grid */}
          <View style={styles.tacticalGrid}>
            {/* Run Defense */}
            <View style={styles.tacticalColumn}>
              <Text style={styles.tacticalColumnTitle}>🏃 vs Run</Text>
              {blitzPackage.run_strengths && blitzPackage.run_strengths.length > 0 && (
                <View style={styles.tacticalSection}>
                  <Text style={styles.tacticalSectionTitle}>✅ Strengths</Text>
                  {blitzPackage.run_strengths.slice(0, 2).map((strength, index) => (
                    <Text key={index} style={styles.tacticalItem}>
                      • {strength.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  ))}
                </View>
              )}
              {blitzPackage.run_weaknesses && blitzPackage.run_weaknesses.length > 0 && (
                <View style={styles.tacticalSection}>
                  <Text style={styles.tacticalSectionTitle}>⚠️ Weaknesses</Text>
                  {blitzPackage.run_weaknesses.slice(0, 2).map((weakness, index) => (
                    <Text key={index} style={styles.tacticalItem}>
                      • {weakness.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            {/* Pass Defense */}
            <View style={styles.tacticalColumn}>
              <Text style={styles.tacticalColumnTitle}>🎯 vs Pass</Text>
              {blitzPackage.pass_strengths && blitzPackage.pass_strengths.length > 0 && (
                <View style={styles.tacticalSection}>
                  <Text style={styles.tacticalSectionTitle}>✅ Strengths</Text>
                  {blitzPackage.pass_strengths.slice(0, 2).map((strength, index) => (
                    <Text key={index} style={styles.tacticalItem}>
                      • {strength.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  ))}
                </View>
              )}
              {blitzPackage.pass_weaknesses && blitzPackage.pass_weaknesses.length > 0 && (
                <View style={styles.tacticalSection}>
                  <Text style={styles.tacticalSectionTitle}>⚠️ Weaknesses</Text>
                  {blitzPackage.pass_weaknesses.slice(0, 2).map((weakness, index) => (
                    <Text key={index} style={styles.tacticalItem}>
                      • {weakness.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Best Against */}
          {blitzPackage.best_against && blitzPackage.best_against.length > 0 && (
            <View style={styles.bestAgainstSection}>
              <Text style={styles.bestAgainstTitle}>🎯 Most Effective Against</Text>
              <View style={styles.bestAgainstList}>
                {blitzPackage.best_against.slice(0, 3).map((item, index) => (
                  <View key={index} style={styles.bestAgainstTag}>
                    <Text style={styles.bestAgainstText}>
                      {item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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

// Coverage Package Card Component
const CoveragePackageCard = ({ coverage, isExpanded, onToggle, expandedBlitzes, onBlitzToggle }) => {
  const getCoverageTypeColor = (type) => {
    return type === 'man' ? '#3b82f6' : '#8b5cf6';
  };

  return (
    <View style={[styles.coverageCard, { borderLeftColor: getCoverageTypeColor(coverage.coverage_type) }]}>
      <TouchableOpacity onPress={onToggle} style={styles.coverageCardHeader}>
        <View style={styles.coverageCardTitle}>
          <Text style={styles.coverageIcon}>
            {coverage.coverage_type === 'man' ? '👤' : '🌐'}
          </Text>
          <View style={styles.coverageTitleContainer}>
            <Text style={styles.coverageName}>{coverage.name}</Text>
            <Text style={styles.coverageType}>
              {coverage.coverage_type.toUpperCase()} Coverage • {coverage.blitz_packages.length} Blitz Packages
            </Text>
          </View>
        </View>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.coverageCardContent}>
          {/* Coverage Description */}
          <Text style={styles.coverageDescription}>{coverage.description}</Text>

          {/* Coverage Analysis Grid */}
          <View style={styles.coverageAnalysisGrid}>
            {/* Base Strengths */}
            {coverage.base_strengths && coverage.base_strengths.length > 0 && (
              <View style={styles.analysisSection}>
                <Text style={styles.analysisSectionTitle}>💪 Base Strengths</Text>
                {coverage.base_strengths.slice(0, 3).map((strength, index) => (
                  <Text key={index} style={styles.analysisItem}>
                    • {strength.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                ))}
              </View>
            )}

            {/* Base Weaknesses */}
            {coverage.base_weaknesses && coverage.base_weaknesses.length > 0 && (
              <View style={styles.analysisSection}>
                <Text style={styles.analysisSectionTitle}>⚠️ Base Weaknesses</Text>
                {coverage.base_weaknesses.slice(0, 3).map((weakness, index) => (
                  <Text key={index} style={styles.analysisItem}>
                    • {weakness.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Optimal Situations & Vulnerable To */}
          <View style={styles.situationalAnalysis}>
            {coverage.optimal_situations && coverage.optimal_situations.length > 0 && (
              <View style={styles.situationSection}>
                <Text style={styles.situationSectionTitle}>🎯 Optimal Situations</Text>
                <View style={styles.situationTags}>
                  {coverage.optimal_situations.slice(0, 4).map((situation, index) => (
                    <View key={index} style={[styles.situationTag, { backgroundColor: '#dcfce7' }]}>
                      <Text style={[styles.situationTagText, { color: '#166534' }]}>
                        {situation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {coverage.vulnerable_to && coverage.vulnerable_to.length > 0 && (
              <View style={styles.situationSection}>
                <Text style={styles.situationSectionTitle}>❌ Vulnerable To</Text>
                <View style={styles.situationTags}>
                  {coverage.vulnerable_to.slice(0, 4).map((vulnerability, index) => (
                    <View key={index} style={[styles.situationTag, { backgroundColor: '#fef2f2' }]}>
                      <Text style={[styles.situationTagText, { color: '#dc2626' }]}>
                        {vulnerability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Blitz Packages */}
          <View style={styles.blitzPackagesSection}>
            <Text style={styles.blitzPackagesTitle}>
              🔥 Blitz Packages ({coverage.blitz_packages.length})
            </Text>
            <Text style={styles.blitzPackagesSubtitle}>
              Tap any blitz package to see detailed pressure schemes
            </Text>

            {coverage.blitz_packages.map((blitzPackage) => (
              <BlitzPackageCard
                key={blitzPackage.key}
                blitzPackage={blitzPackage}
                isExpanded={expandedBlitzes.has(blitzPackage.key)}
                onToggle={() => onBlitzToggle(blitzPackage.key)}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

// Formation Analysis Component
const FormationAnalysis = ({ formation }) => (
  <View style={styles.formationAnalysisContainer}>
    {/* Base Formation Stats */}
    <View style={styles.formationStatsGrid}>
      <View style={styles.formationStatItem}>
        <Text style={styles.formationStatNumber}>{formation.total_coverages}</Text>
        <Text style={styles.formationStatLabel}>Coverage Packages</Text>
      </View>
      <View style={styles.formationStatItem}>
        <Text style={[styles.formationStatNumber, { color: '#ef4444' }]}>
          {formation.coverages.reduce((sum, c) => sum + c.blitz_packages.length, 0)}
        </Text>
        <Text style={styles.formationStatLabel}>Total Blitz Schemes</Text>
      </View>
      <View style={styles.formationStatItem}>
        <Text style={[styles.formationStatNumber, { color: '#8b5cf6' }]}>
          {formation.coverages.filter(c => c.coverage_type === 'zone').length}
        </Text>
        <Text style={styles.formationStatLabel}>Zone Coverages</Text>
      </View>
      <View style={styles.formationStatItem}>
        <Text style={[styles.formationStatNumber, { color: '#3b82f6' }]}>
          {formation.coverages.filter(c => c.coverage_type === 'man').length}
        </Text>
        <Text style={styles.formationStatLabel}>Man Coverages</Text>
      </View>
    </View>

    {/* Formation Strengths, Weaknesses, Optimal Situations */}
    {(formation.base_strengths?.length > 0 || formation.base_weaknesses?.length > 0 || formation.optimal_situations?.length > 0) && (
      <View style={styles.formationDetailsGrid}>
        {formation.base_strengths && formation.base_strengths.length > 0 && (
          <View style={styles.formationDetailSection}>
            <Text style={styles.formationDetailTitle}>💪 Formation Strengths</Text>
            {formation.base_strengths.slice(0, 3).map((strength, index) => (
              <Text key={index} style={styles.formationDetailItem}>
                • {strength.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            ))}
          </View>
        )}

        {formation.base_weaknesses && formation.base_weaknesses.length > 0 && (
          <View style={styles.formationDetailSection}>
            <Text style={styles.formationDetailTitle}>⚠️ Formation Weaknesses</Text>
            {formation.base_weaknesses.slice(0, 3).map((weakness, index) => (
              <Text key={index} style={styles.formationDetailItem}>
                • {weakness.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            ))}
          </View>
        )}

        {formation.optimal_situations && formation.optimal_situations.length > 0 && (
          <View style={styles.formationOptimalSection}>
            <Text style={styles.formationDetailTitle}>🎯 Optimal Situations</Text>
            <View style={styles.optimalSituationsTags}>
              {formation.optimal_situations.slice(0, 4).map((situation, index) => (
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

export default function DefensiveFormationDetailScreen({ route, navigation }) {
  const { formationKey, formationName } = route.params;
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCoverages, setExpandedCoverages] = useState(new Set());
  const [expandedBlitzes, setExpandedBlitzes] = useState(new Set());

  useEffect(() => {
    loadFormationDetails();
  }, [formationKey]);

  const loadFormationDetails = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getDefensiveFormationDetails(formationKey);
      setFormation(data);
    } catch (error) {
      console.error('Error loading defensive formation details:', error);
      Alert.alert(
        'Error',
        'Failed to load formation details. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleCoverageExpansion = (coverageKey) => {
    const newExpanded = new Set(expandedCoverages);
    if (newExpanded.has(coverageKey)) {
      newExpanded.delete(coverageKey);
    } else {
      newExpanded.add(coverageKey);
    }
    setExpandedCoverages(newExpanded);
  };

  const toggleBlitzExpansion = (blitzKey) => {
    const newExpanded = new Set(expandedBlitzes);
    if (newExpanded.has(blitzKey)) {
      newExpanded.delete(blitzKey);
    } else {
      newExpanded.add(blitzKey);
    }
    setExpandedBlitzes(newExpanded);
  };

  const getFormationEmoji = (formationName) => {
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
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{formationName}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1f4e79" />
          <Text style={styles.loadingText}>Loading formation details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!formation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Error</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Formation not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{formation.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Formation Header */}
        <View style={styles.formationHeader}>
          <View style={styles.formationTitleRow}>
            <Text style={styles.formationEmoji}>{getFormationEmoji(formation.name)}</Text>
            <View style={styles.formationTitleContainer}>
              <Text style={styles.formationTitle}>{formation.name}</Text>
              <Text style={styles.personnelText}>{formation.personnel}</Text>
            </View>
          </View>
          
          <Text style={styles.descriptionText}>{formation.description}</Text>
        </View>

        {/* Field Visualization */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldTitle}>🏈 Formation Visual</Text>
          <View style={styles.fieldVisualWrapper}>
            <SVGFieldVisualizer 
              formationName={formationKey}
              yardsToGo={10}
              coverageName="Base Coverage"
              showCoverage={false}
              showBlitz={false}
              onPlayerPress={() => {}}
            />
          </View>
          <Text style={styles.fieldSubtitle}>
            Clean pre-snap view showing only player positions
          </Text>
        </View>

        {/* Formation Analysis */}
        <FormationAnalysis formation={formation} />

        {/* Coverage Packages */}
        <View style={styles.coveragePackagesSection}>
          <Text style={styles.coveragePackagesTitle}>
            🛡️ Coverage Packages ({formation.coverages.length})
          </Text>
          <Text style={styles.coveragePackagesSubtitle}>
            Each coverage has multiple blitz schemes for different situations
          </Text>

          {formation.coverages.map((coverage) => (
            <CoveragePackageCard
              key={coverage.key}
              coverage={coverage}
              isExpanded={expandedCoverages.has(coverage.key)}
              onToggle={() => toggleCoverageExpansion(coverage.key)}
              expandedBlitzes={expandedBlitzes}
              onBlitzToggle={toggleBlitzExpansion}
            />
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Study these coverage packages and blitz schemes to understand defensive strategy and how to attack each look
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
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
  },

  // Formation Header
  formationHeader: {
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
  formationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  formationEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  formationTitleContainer: {
    flex: 1,
  },
  formationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f4e79',
  },
  personnelText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
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

  // Formation Analysis
  formationAnalysisContainer: {
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
  formationStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formationStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  formationStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f4e79',
  },
  formationStatLabel: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  formationDetailsGrid: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  formationDetailSection: {
    marginBottom: 12,
  },
  formationDetailTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 6,
  },
  formationDetailItem: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 2,
  },
  formationOptimalSection: {
    marginTop: 8,
  },
  optimalSituationsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  optimalSituationTag: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  optimalSituationText: {
    fontSize: 10,
    color: '#4b5563',
    fontWeight: '500',
  },

  // Coverage Packages Section
  coveragePackagesSection: {
    marginBottom: 20,
  },
  coveragePackagesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 4,
  },
  coveragePackagesSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },

  // Coverage Card
  coverageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coverageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  coverageCardTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverageIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  coverageTitleContainer: {
    flex: 1,
  },
  coverageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f4e79',
  },
  coverageType: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 16,
    color: '#9ca3af',
    marginLeft: 12,
  },

  // Coverage Card Content
  coverageCardContent: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    padding: 16,
  },
  coverageDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  coverageAnalysisGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  analysisSection: {
    flex: 1,
    marginHorizontal: 4,
  },
  analysisSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 4,
  },
  analysisItem: {
    fontSize: 11,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 2,
  },

  // Situational Analysis
  situationalAnalysis: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  situationSection: {
    marginBottom: 12,
  },
  situationSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 6,
  },
  situationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  situationTag: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  situationTagText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Blitz Packages Section
  blitzPackagesSection: {
    marginTop: 16,
  },
  blitzPackagesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 4,
  },
  blitzPackagesSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },

  // Blitz Card
  blitzCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  blitzCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  blitzCardTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  blitzIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  blitzTitleContainer: {
    flex: 1,
  },
  blitzName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f4e79',
  },
  blitzDetails: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 1,
  },
  rusherBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  rusherText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },

  // Blitz Card Content
  blitzCardContent: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 12,
  },
  adjustmentSection: {
    backgroundColor: '#fff7ed',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  adjustmentTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#c2410c',
    marginBottom: 2,
  },
  adjustmentText: {
    fontSize: 11,
    color: '#9a3412',
  },
  tacticalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tacticalColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  tacticalColumnTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 6,
  },
  tacticalSection: {
    marginBottom: 8,
  },
  tacticalSectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: 2,
  },
  tacticalItem: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 14,
    marginBottom: 1,
  },

  // Best Against Section
  bestAgainstSection: {
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    padding: 8,
  },
  bestAgainstTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 6,
  },
  bestAgainstList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  bestAgainstTag: {
    backgroundColor: '#fbbf24',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  bestAgainstText: {
    fontSize: 9,
    color: '#78350f',
    fontWeight: '500',
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