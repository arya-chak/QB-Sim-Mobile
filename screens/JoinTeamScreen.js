// screens/JoinTeamScreen.js
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';

export default function JoinTeamScreen() {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updateProfile } = useAuth();

  const handleJoinTeam = async () => {
    if (!inviteCode) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    setLoading(true);

    try {
      // Search for team with this invite code
      const teamsRef = collection(db, 'teams');
      const q = query(teamsRef, where('inviteCode', '==', inviteCode.toUpperCase().trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Invalid Code', 'No team found with this invite code. Please check and try again.');
        setLoading(false);
        return;
      }

      // Get the team
      const teamDoc = querySnapshot.docs[0];
      const teamId = teamDoc.id;
      const teamData = teamDoc.data();

      // Update user's teamId
      await updateDoc(doc(db, 'users', user.uid), {
        teamId: teamId
      });

      // Add user to team_members
      await addDoc(collection(db, 'teamMembers'), {
        teamId: teamId,
        userId: user.uid,
        role: user.role, // 'coach' or 'player'
        joinedAt: new Date(),
        status: 'active'
      });

      // Update local user state
      await updateProfile({ teamId: teamId });

      Alert.alert(
        'Success!',
        `You've joined ${teamData.teamName}!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error joining team:', error);
      Alert.alert('Error', 'Failed to join team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.icon}>🎟️</Text>
            <Text style={styles.title}>Join Your Team</Text>
            <Text style={styles.subtitle}>
              {user?.role === 'coach' 
                ? 'Enter the team code provided by PreSnap Prep'
                : 'Enter the team code from your coach'
              }
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Team Invite Code</Text>
            <TextInput
              style={styles.input}
              placeholder="LNHS24"
              placeholderTextColor="#64748b"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
              maxLength={10}
              editable={!loading}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                {user?.role === 'coach' 
                  ? '💡 Contact PreSnap Prep to set up your team and receive your invite code.'
                  : '💡 Ask your coach for the team invite code.'
                }
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.joinButton, loading && styles.joinButtonDisabled]}
              onPress={handleJoinTeam}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.joinButtonText}>Join Team</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 16,
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#1e293b',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
  },
  joinButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});