// screens/CoachDashboardScreen.js
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function CoachDashboardScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome, Coach!</Text>
            <Text style={styles.userName}>
              {user?.profile?.firstName} {user?.profile?.lastName}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Coming Soon Message */}
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonIcon}>🚧</Text>
          <Text style={styles.comingSoonTitle}>Dashboard Coming Soon!</Text>
          <Text style={styles.comingSoonText}>
            Your virtual classroom dashboard is under construction. Soon you'll be able to:
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>📊 Monitor player activity</Text>
            <Text style={styles.featureItem}>📝 Assign homework</Text>
            <Text style={styles.featureItem}>💬 Message players</Text>
            <Text style={styles.featureItem}>📈 View team analytics</Text>
          </View>
        </View>

        {/* Quick Actions Preview */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Coming in Phase 2</Text>
          
          <View style={styles.actionButton}>
            <Text style={styles.actionButtonIcon}>📊</Text>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>Player Monitoring</Text>
              <Text style={styles.actionButtonSubtitle}>See who's studying</Text>
            </View>
          </View>

          <View style={styles.actionButton}>
            <Text style={styles.actionButtonIcon}>📝</Text>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>Create Assignment</Text>
              <Text style={styles.actionButtonSubtitle}>Assign plays to study</Text>
            </View>
          </View>

          <View style={styles.actionButton}>
            <Text style={styles.actionButtonIcon}>💬</Text>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>Message Players</Text>
              <Text style={styles.actionButtonSubtitle}>Send feedback</Text>
            </View>
          </View>

          <View style={styles.actionButton}>
            <Text style={styles.actionButtonIcon}>📈</Text>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>Team Analytics</Text>
              <Text style={styles.actionButtonSubtitle}>Track readiness</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
  comingSoon: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  comingSoonIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  featureList: {
    alignSelf: 'stretch',
  },
  featureItem: {
    fontSize: 16,
    color: '#e2e8f0',
    paddingVertical: 8,
    paddingLeft: 8,
  },
  quickActions: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    opacity: 0.6,
  },
  actionButtonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
});