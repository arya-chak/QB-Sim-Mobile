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
  TextInput
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

// Defensive Formation Card Component
const DefensiveFormationCard = ({ formation, onPress, isLandscape }) => {
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

  const getComplexityColor = (totalBlitzPackages) => {
    if (totalBlitzPackages >= 30) return '#ef4444'; // Red - Very Complex
    if (totalBlitzPackages >= 20) return '#f59e0b'; // Orange - Complex  
    if (totalBlitzPackages >= 10) return '#10b981'; // Green - Moderate
    return '#3b82f6'; // Blue - Simple
  };

  const getComplexityLabel = (totalBlitzPackages) => {
    if (totalBlitzPackages >= 30) return 'Very Complex';
    if (totalBlitzPackages >= 20) return 'Complex';
    if (totalBlitzPackages >= 10) return 'Moderate';
    return 'Simple';
  };

  return (
    <TouchableOpacity 
      style={[
        styles.formationCard,
        isLandscape && styles.formationCardLandscape
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.formationEmoji}>
          {getFormationEmoji(formation.name)}
        </Text>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.formationName}>{formation.name}</Text>
          <Text style={styles.personnelText}>{formation.personnel}</Text>
        </View>
        <View style={[
          styles.complexityBadge,
          { backgroundColor: getComplexityColor(formation.total_blitz_packages) }
        ]}>
          <Text style={styles.complexityText}>
            {getComplexityLabel(formation.total_blitz_packages)}
          </Text>
        </View>
      </View>

      <Text style={styles.descriptionText} numberOfLines={2}>
        {formation.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.packageBreakdown}>
          <View style={styles.packageCount}>
            <View style={[styles.packageDot, { backgroundColor: '#8b5cf6' }]} />
            <Text style={styles.packageText}>{formation.total_coverages} Coverages</Text>
          </View>
          <View style={styles.packageCount}>
            <View style={[styles.packageDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.packageText}>{formation.total_blitz_packages} Blitzes</Text>
          </View>
        </View>
        <Text style={styles.viewDetailsText}>Explore →</Text>
      </View>
    </TouchableOpacity>
  );
};

// Search Bar Component
const SearchBar = ({ searchQuery, setSearchQuery, onSearch }) => (
  <View style={styles.searchContainer}>
    <TextInput
      style={styles.searchInput}
      placeholder="Search formations, coverages, and blitzes..."
      placeholderTextColor="#9ca3af"
      value={searchQuery}
      onChangeText={setSearchQuery}
      onSubmitEditing={onSearch}
      returnKeyType="search"
    />
    <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
      <Text style={styles.searchButtonText}>🔍</Text>
    </TouchableOpacity>
  </View>
);

// Stats Overview Component
const StatsOverview = ({ formations }) => {
  const totalCoverages = formations.reduce((sum, f) => sum + f.total_coverages, 0);
  const totalBlitzes = formations.reduce((sum, f) => sum + f.total_blitz_packages, 0);
  const avgComplexity = Math.round(totalBlitzes / formations.length);

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{formations.length}</Text>
        <Text style={styles.statLabel}>Formations</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: '#8b5cf6' }]}>{totalCoverages}</Text>
        <Text style={styles.statLabel}>Coverages</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: '#ef4444' }]}>{totalBlitzes}</Text>
        <Text style={styles.statLabel}>Blitz Packages</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{avgComplexity}</Text>
        <Text style={styles.statLabel}>Avg Schemes</Text>
      </View>
    </View>
  );
};

// Formation Type Filter Component
const FormationTypeFilter = ({ selectedType, onTypeChange }) => {
  const types = [
    { key: 'all', label: 'All Formations', color: '#6b7280' },
    { key: 'base', label: 'Base Defenses', color: '#3b82f6' },
    { key: 'sub', label: 'Sub Packages', color: '#8b5cf6' },
    { key: 'goal_line', label: 'Goal Line', color: '#ef4444' }
  ];

  const getFormationType = (formationName) => {
    const name = formationName.toLowerCase();
    if (name.includes('nickel') || name.includes('dime')) return 'sub';
    if (name.includes('46') || name.includes('5-2')) return 'goal_line';
    return 'base';
  };

  return (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterChips}>
          {types.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.filterChip,
                selectedType === type.key && { backgroundColor: type.color }
              ]}
              onPress={() => onTypeChange(type.key)}
            >
              <Text style={[
                styles.filterChipText,
                selectedType === type.key && styles.filterChipTextActive
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default function DefensiveLibraryScreen({ navigation }) {
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';

  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    loadFormations();
  }, []);

  useEffect(() => {
    // Filter formations based on search query and type
    let filtered = formations;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(formation => {
        const name = formation.name.toLowerCase();
        switch (selectedType) {
          case 'base':
            return !name.includes('nickel') && !name.includes('dime') && 
                   !name.includes('46') && !name.includes('5-2');
          case 'sub':
            return name.includes('nickel') || name.includes('dime');
          case 'goal_line':
            return name.includes('46') || name.includes('5-2');
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(formation =>
        formation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formation.personnel.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFormations(filtered);
  }, [searchQuery, formations, selectedType]);

  const loadFormations = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getLibraryDefensiveFormations();
      setFormations(data.formations);
      setFilteredFormations(data.formations);
    } catch (error) {
      console.error('Error loading defensive formations:', error);
      Alert.alert(
        'Error',
        'Failed to load defensive formations. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormationPress = (formation) => {
    navigation.navigate('DefensiveFormationDetail', { 
      formationKey: formation.key,
      formationName: formation.name 
    });
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') return;

    try {
      const results = await ApiService.searchLibrary(searchQuery, 'defensive');
      if (results.total_results === 0) {
        Alert.alert('No Results', `No formations or coverage packages found for "${searchQuery}"`);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🛡️ Defensive Library</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1f4e79" />
          <Text style={styles.loadingText}>Loading defensive formations...</Text>
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
        <Text style={styles.title}>🛡️ Defensive Library</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadFormations}
        >
          <Text style={styles.refreshButtonText}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <SearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
        />

        {/* Stats Overview */}
        <StatsOverview formations={formations} />

        {/* Formation Type Filter */}
        <FormationTypeFilter 
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Defensive Formations</Text>
          <Text style={styles.sectionSubtitle}>
            {filteredFormations.length} of {formations.length} formations
            {searchQuery ? ` matching "${searchQuery}"` : ''}
            {selectedType !== 'all' ? ` in ${selectedType}` : ''}
          </Text>
        </View>

        {/* Formations Grid */}
        <View style={[
          styles.formationsGrid,
          isLandscape && styles.formationsGridLandscape
        ]}>
          {filteredFormations.map((formation) => (
            <DefensiveFormationCard
              key={formation.key}
              formation={formation}
              onPress={() => handleFormationPress(formation)}
              isLandscape={isLandscape}
            />
          ))}
        </View>

        {/* No results message */}
        {filteredFormations.length === 0 && (searchQuery || selectedType !== 'all') && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              No formations found for your search criteria
            </Text>
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                setSelectedType('all');
              }}
              style={styles.clearSearchButton}
            >
              <Text style={styles.clearSearchButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Explore defensive formations to understand coverage packages and blitz schemes
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
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
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
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
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
  
  // Search Components
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },

  // Stats Components
  statsContainer: {
    flexDirection: 'row',
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f4e79',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  // Filter Components
  filterContainer: {
    marginBottom: 20,
  },
  filterChips: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },

  // Section Header
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f4e79',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },

  // Formation Grid
  formationsGrid: {
    gap: 16,
  },
  formationsGridLandscape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Formation Card
  formationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#1f4e79',
  },
  formationCardLandscape: {
    width: '48%',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  formationEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  formationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4e79',
  },
  personnelText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 2,
  },
  complexityBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  complexityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageBreakdown: {
    flexDirection: 'row',
    gap: 12,
  },
  packageCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  packageText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#1f4e79',
    fontWeight: '600',
  },

  // No Results
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  clearSearchButton: {
    backgroundColor: '#1f4e79',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: 'white',
    fontWeight: '600',
  },

  // Footer
  footer: {
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});