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

// Formation Card Component
const FormationCard = ({ formation, onPress, isLandscape }) => {
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
          <Text style={styles.personnelPackage}>{formation.personnel_package}</Text>
        </View>
        <View style={styles.playCountBadge}>
          <Text style={styles.playCountText}>{formation.total_plays}</Text>
          <Text style={styles.playCountLabel}>plays</Text>
        </View>
      </View>

      <Text style={styles.personnelText}>{formation.personnel}</Text>
      <Text style={styles.descriptionText} numberOfLines={2}>
        {formation.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.playBreakdown}>
          <View style={styles.playTypeCount}>
            <View style={[styles.playTypeDot, { backgroundColor: '#3b82f6' }]} />
            <Text style={styles.playTypeText}>{formation.total_passing_plays} Pass</Text>
          </View>
          <View style={styles.playTypeCount}>
            <View style={[styles.playTypeDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.playTypeText}>{formation.total_running_plays} Run</Text>
          </View>
        </View>
        <Text style={styles.viewDetailsText}>Tap to explore →</Text>
      </View>
    </TouchableOpacity>
  );
};

// Search Bar Component
const SearchBar = ({ searchQuery, setSearchQuery, onSearch }) => (
  <View style={styles.searchContainer}>
    <TextInput
      style={styles.searchInput}
      placeholder="Search formations and plays..."
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
  const totalPlays = formations.reduce((sum, f) => sum + f.total_plays, 0);
  const totalPassing = formations.reduce((sum, f) => sum + f.total_passing_plays, 0);
  const totalRunning = formations.reduce((sum, f) => sum + f.total_running_plays, 0);

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{formations.length}</Text>
        <Text style={styles.statLabel}>Formations</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{totalPlays}</Text>
        <Text style={styles.statLabel}>Total Plays</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: '#3b82f6' }]}>{totalPassing}</Text>
        <Text style={styles.statLabel}>Passing</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: '#10b981' }]}>{totalRunning}</Text>
        <Text style={styles.statLabel}>Running</Text>
      </View>
    </View>
  );
};

export default function OffensiveLibraryScreen({ navigation }) {
  const orientation = useOrientation();
  const isLandscape = orientation === 'landscape';

  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFormations, setFilteredFormations] = useState([]);

  useEffect(() => {
    loadFormations();
  }, []);

  useEffect(() => {
    // Filter formations based on search query
    if (searchQuery.trim() === '') {
      setFilteredFormations(formations);
    } else {
      const filtered = formations.filter(formation =>
        formation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formation.personnel.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFormations(filtered);
    }
  }, [searchQuery, formations]);

  const loadFormations = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getLibraryOffensiveFormations();
      setFormations(data.formations);
      setFilteredFormations(data.formations);
    } catch (error) {
      console.error('Error loading formations:', error);
      Alert.alert(
        'Error',
        'Failed to load offensive formations. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormationPress = (formation) => {
    navigation.navigate('OffensiveFormationDetail', { 
      formationKey: formation.key,
      formationName: formation.name 
    });
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') return;

    try {
      const results = await ApiService.searchLibrary(searchQuery, 'offensive');
      // Handle search results - you could navigate to a search results screen
      if (results.total_results === 0) {
        Alert.alert('No Results', `No formations or plays found for "${searchQuery}"`);
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
          <Text style={styles.title}>🏈 Offensive Library</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1f4e79" />
          <Text style={styles.loadingText}>Loading formations...</Text>
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
        <Text style={styles.title}>🏈 Offensive Library</Text>
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

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Formation Library</Text>
          <Text style={styles.sectionSubtitle}>
            {filteredFormations.length} of {formations.length} formations
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </Text>
        </View>

        {/* Formations Grid */}
        <View style={[
          styles.formationsGrid,
          isLandscape && styles.formationsGridLandscape
        ]}>
          {filteredFormations.map((formation) => (
            <FormationCard
              key={formation.key}
              formation={formation}
              onPress={() => handleFormationPress(formation)}
              isLandscape={isLandscape}
            />
          ))}
        </View>

        {/* No results message */}
        {filteredFormations.length === 0 && searchQuery && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              No formations found for "{searchQuery}"
            </Text>
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchButton}
            >
              <Text style={styles.clearSearchButtonText}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tap any formation to explore its plays, strengths, and tactical details
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
  personnelPackage: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
    marginTop: 2,
  },
  playCountBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  playCountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f4e79',
  },
  playCountLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  personnelText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    fontWeight: '500',
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
  playBreakdown: {
    flexDirection: 'row',
    gap: 12,
  },
  playTypeCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  playTypeText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#3b82f6',
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
    backgroundColor: '#3b82f6',
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