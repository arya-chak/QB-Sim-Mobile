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

// Play Card Component
const PlayCard = ({ play, isExpanded, onToggle, playType }) => {
  const playTypeColor = playType === 'passing' ? '#3b82f6' : '#10b981';
  const playTypeIcon = playType === 'passing' ? '🎯' : '🏃';

  return (
    <View style={[styles.playCard, { borderLeftColor: playTypeColor }]}>
      <TouchableOpacity onPress={onToggle} style={styles.playCardHeader}>
        <View style={styles.playCardTitle}>
          <Text style={styles.playTypeIcon}>{playTypeIcon}</Text>
          <View style={styles.playTitleContainer}>
            <Text style={styles.playName}>{play.name}</Text>
            <Text style={styles.playConcept}>{play.concept}</Text>
          </View>
        </View>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.playCardContent}>
          {/* Basic Play Info */}
          <View style={styles.playInfoGrid}>
            {playType === 'passing' ? (
              <>
                <View style={styles.playInfoItem}>
                  <Text style={styles.playInfoLabel}>Protection:</Text>
                  <Text style={styles.playInfoValue}>
                    {play.protection.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </View>
                <View style={styles.playInfoItem}>
                  <Text style={styles.playInfoLabel}>Target Yards:</Text>
                  <Text style={styles.playInfoValue}>{play.target_yards}</Text>
                </View>
                <View style={styles.playInfoItem}>
                  <Text style={styles.playInfoLabel}>Timing:</Text>
                  <Text style={styles.playInfoValue}>
                    {play.time_to_throw.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.playInfoItem}>
                  <Text style={styles.playInfoLabel}>Blocking:</Text>
                  <Text style={styles.playInfoValue}>
                    {play.blocking_scheme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </View>
                <View style={styles.playInfoItem}>
                  <Text style={styles.playInfoLabel}>Ball Carrier:</Text>
                  <Text style={styles.playInfoValue}>
                    {play.ball_carrier.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </View>
                <View style={styles.playInfoItem}>
                  <Text style={styles.playInfoLabel}>Target Gap:</Text>
                  <Text style={styles.playInfoValue}>
                    {play.target_gap.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </View>
                {play.lead_blocker && play.lead_blocker !== 'none' && (
                  <View style={styles.playInfoItem}>
                    <Text style={styles.playInfoLabel}>Lead Blocker:</Text>
                    <Text style={styles.playInfoValue}>
                      {play.lead_blocker.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Routes (for passing plays) */}
          {playType === 'passing' && play.routes && Object.keys(play.routes).length > 0 && (
            <View style={styles.routesSection}>
              <Text style={styles.sectionTitle}>📋 Route Assignments</Text>
              <View style={styles.routesList}>
                {Object.entries(play.routes).map(([receiver, route]) => (
                  <View key={receiver} style={styles.routeItem}>
                    <Text style={styles.receiverName}>
                      {receiver.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                    </Text>
                    <Text style={styles.routeName}>
                      {route.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tactical Analysis */}
          <View style={styles.tacticalAnalysis}>
            <View style={styles.tacticalGrid}>
              {/* Best Against */}
              {play.best_against && play.best_against.length > 0 && (
                <View style={styles.tacticalSection}>
                  <Text style={styles.tacticalTitle}>✅ Best Against</Text>
                  {play.best_against.slice(0, 3).map((item, index) => (
                    <Text key={index} style={styles.tacticalItem}>
                      • {item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  ))}
                </View>
              )}

              {/* Worst Against */}
              {play.worst_against && play.worst_against.length > 0 && (
                <View style={styles.tacticalSection}>
                  <Text style={styles.tacticalTitle}>❌ Worst Against</Text>
                  {play.worst_against.slice(0, 3).map((item, index) => (
                    <Text key={index} style={styles.tacticalItem}>
                      • {item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  ))}
                </View>
              )}

              {/* Strengths */}
              {play.strengths && play.strengths.length > 0 && (
                <View style={styles.tacticalSection}>
                  <Text style={styles.tacticalTitle}>💪 Strengths</Text>
                  {play.strengths.slice(0, 3).map((item, index) => (
                    <Text key={index} style={styles.tacticalItem}>
                      • {item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  ))}
                </View>
              )}

              {/* Weaknesses */}
              {play.weaknesses && play.weaknesses.length > 0 && (
                <View style={styles.tacticalSection}>
                  <Text style={styles.tacticalTitle}>⚠️ Weaknesses</Text>
                  {play.weaknesses.slice(0, 3).map((item, index) => (
                    <Text key={index} style={styles.tacticalItem}>
                      • {item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

// Formation Strengths/Weaknesses Component
const FormationAnalysis = ({ formation }) => (
  <View style={styles.analysisContainer}>
    <View style={styles.analysisGrid}>
      {/* Formation Strengths */}
      {formation.formation_strengths && formation.formation_strengths.length > 0 && (
        <View style={styles.analysisSection}>
          <Text style={styles.analysisSectionTitle}>💪 Formation Strengths</Text>
          {formation.formation_strengths.slice(0, 4).map((strength, index) => (
            <Text key={index} style={styles.analysisItem}>
              • {strength.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          ))}
        </View>
      )}

      {/* Formation Weaknesses */}
      {formation.formation_weaknesses && formation.formation_weaknesses.length > 0 && (
        <View style={styles.analysisSection}>
          <Text style={styles.analysisSectionTitle}>⚠️ Formation Weaknesses</Text>
          {formation.formation_weaknesses.slice(0, 4).map((weakness, index) => (
            <Text key={index} style={styles.analysisItem}>
              • {weakness.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          ))}
        </View>
      )}
    </View>

    {/* Optimal Situations */}
    {formation.optimal_situations && formation.optimal_situations.length > 0 && (
      <View style={styles.optimalSituationsSection}>
        <Text style={styles.analysisSectionTitle}>🎯 Optimal Situations</Text>
        <View style={styles.situationsList}>
          {formation.optimal_situations.map((situation, index) => (
            <View key={index} style={styles.situationTag}>
              <Text style={styles.situationText}>
                {situation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
          ))}
        </View>
      </View>
    )}
  </View>
);

export default function OffensiveFormationDetailScreen({ route, navigation }) {
  const { formationKey, formationName } = route.params;
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';

  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('passing'); // 'passing' or 'running'
  const [expandedPlays, setExpandedPlays] = useState(new Set());

  useEffect(() => {
    loadFormationDetails();
  }, [formationKey]);

  const loadFormationDetails = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getOffensiveFormationDetails(formationKey);
      setFormation(data);
    } catch (error) {
      console.error('Error loading formation details:', error);
      Alert.alert(
        'Error',
        'Failed to load formation details. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePlayExpansion = (playKey) => {
    const newExpanded = new Set(expandedPlays);
    if (newExpanded.has(playKey)) {
      newExpanded.delete(playKey);
    } else {
      newExpanded.add(playKey);
    }
    setExpandedPlays(newExpanded);
  };

  const getFormationEmoji = (formationName) => {
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

  const currentPlays = activeTab === 'passing' ? formation.passing_plays : formation.running_plays;

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
              <Text style={styles.personnelPackage}>{formation.personnel_package}</Text>
            </View>
          </View>
          
          <Text style={styles.personnelText}>{formation.personnel}</Text>
          <Text style={styles.descriptionText}>{formation.description}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Text style={styles.statNumber}>{formation.total_plays}</Text>
              <Text style={styles.statLabel}>Total Plays</Text>
            </View>
            <View style={[styles.statBadge, { backgroundColor: '#eff6ff' }]}>
              <Text style={[styles.statNumber, { color: '#3b82f6' }]}>
                {formation.passing_plays.length}
              </Text>
              <Text style={styles.statLabel}>Passing</Text>
            </View>
            <View style={[styles.statBadge, { backgroundColor: '#f0fdf4' }]}>
              <Text style={[styles.statNumber, { color: '#10b981' }]}>
                {formation.running_plays.length}
              </Text>
              <Text style={styles.statLabel}>Running</Text>
            </View>
          </View>
        </View>

        {/* Formation Analysis */}
        <FormationAnalysis formation={formation} />

        {/* Play Type Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'passing' && styles.activeTab,
              { backgroundColor: activeTab === 'passing' ? '#3b82f6' : '#f3f4f6' }
            ]}
            onPress={() => setActiveTab('passing')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'passing' ? 'white' : '#6b7280' }
            ]}>
              🎯 Passing Plays ({formation.passing_plays.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'running' && styles.activeTab,
              { backgroundColor: activeTab === 'running' ? '#10b981' : '#f3f4f6' }
            ]}
            onPress={() => setActiveTab('running')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'running' ? 'white' : '#6b7280' }
            ]}>
              🏃 Running Plays ({formation.running_plays.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Plays List */}
        <View style={styles.playsSection}>
          <Text style={styles.playsSectionTitle}>
            {activeTab === 'passing' ? 'Passing Plays' : 'Running Plays'}
          </Text>
          <Text style={styles.playsSectionSubtitle}>
            Tap any play to view detailed breakdown
          </Text>

          {currentPlays.map((play) => (
            <PlayCard
              key={play.key}
              play={play}
              playType={activeTab}
              isExpanded={expandedPlays.has(play.key)}
              onToggle={() => togglePlayExpansion(play.key)}
            />
          ))}

          {currentPlays.length === 0 && (
            <View style={styles.noPlaysContainer}>
              <Text style={styles.noPlaysText}>
                No {activeTab} plays available for this formation
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Study these plays to understand when and how to use the {formation.name} effectively
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
  personnelPackage: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginTop: 2,
  },
  personnelText: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f4e79',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },

  // Formation Analysis
  analysisContainer: {
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
  analysisGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  analysisSection: {
    flex: 1,
    marginHorizontal: 4,
  },
  analysisSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 8,
  },
  analysisItem: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 2,
  },
  optimalSituationsSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  situationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  situationTag: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  situationText: {
    fontSize: 11,
    color: '#4b5563',
    fontWeight: '500',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    // backgroundColor set dynamically
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Plays Section
  playsSection: {
    marginBottom: 20,
  },
  playsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 4,
  },
  playsSectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },

  // Play Card
  playCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  playCardTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playTypeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  playTitleContainer: {
    flex: 1,
  },
  playName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f4e79',
  },
  playConcept: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 16,
    color: '#9ca3af',
    marginLeft: 12,
  },

  // Play Card Content
  playCardContent: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    padding: 16,
  },
  playInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  playInfoItem: {
    width: '50%',
    marginBottom: 8,
  },
  playInfoLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  playInfoValue: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
    marginTop: 2,
  },

  // Routes Section
  routesSection: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 8,
  },
  routesList: {
    gap: 4,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiverName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
    width: 100,
  },
  routeName: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },

  // Tactical Analysis
  tacticalAnalysis: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  tacticalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tacticalSection: {
    width: '48%',
    marginBottom: 12,
  },
  tacticalTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f4e79',
    marginBottom: 4,
  },
  tacticalItem: {
    fontSize: 11,
    color: '#6b7280',
    lineHeight: 16,
  },

  // No plays
  noPlaysContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noPlaysText: {
    fontSize: 16,
    color: '#9ca3af',
    fontStyle: 'italic',
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