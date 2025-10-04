// screens/SignupScreen.js
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
  Alert,
  ScrollView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function SignupScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1: Role selection, 2: Account details
  const [role, setRole] = useState(null); // 'coach' or 'player'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState('');
  
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSignup = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const profileData = {
      firstName,
      lastName,
      ...(role === 'player' && {
        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber) : null,
        position: position || null
      })
    };

    const result = await signup(email, password, role, profileData);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Signup Failed', result.error);
    }
    // If successful, AuthContext will handle navigation
  };

  // Step 1: Role Selection
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Role</Text>
            <Text style={styles.subtitle}>Are you a coach or a player?</Text>
          </View>

          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => handleRoleSelection('coach')}
          >
            <Text style={styles.roleIcon}>👨‍🏫</Text>
            <Text style={styles.roleTitle}>I'm a Coach</Text>
            <Text style={styles.roleDescription}>
              Monitor players, assign homework, and track team progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => handleRoleSelection('player')}
          >
            <Text style={styles.roleIcon}>🏈</Text>
            <Text style={styles.roleTitle}>I'm a Player</Text>
            <Text style={styles.roleDescription}>
              Study plays, complete assignments, and improve your game
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backButtonText}>← Back to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Step 2: Account Details
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Create {role === 'coach' ? 'Coach' : 'Player'} Account
            </Text>
            <Text style={styles.subtitle}>Fill in your information</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="John"
              placeholderTextColor="#64748b"
              value={firstName}
              onChangeText={setFirstName}
              editable={!loading}
            />

            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Smith"
              placeholderTextColor="#64748b"
              value={lastName}
              onChangeText={setLastName}
              editable={!loading}
            />

            {role === 'player' && (
              <>
                <Text style={styles.label}>Jersey Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="12"
                  placeholderTextColor="#64748b"
                  value={jerseyNumber}
                  onChangeText={setJerseyNumber}
                  keyboardType="number-pad"
                  editable={!loading}
                />

                <Text style={styles.label}>Position</Text>
                <TextInput
                  style={styles.input}
                  placeholder="QB, RB, WR, etc."
                  placeholderTextColor="#64748b"
                  value={position}
                  onChangeText={setPosition}
                  autoCapitalize="characters"
                  editable={!loading}
                />
              </>
            )}

            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter password"
              placeholderTextColor="#64748b"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButtonSmall}
              onPress={() => setStep(1)}
              disabled={loading}
            >
              <Text style={styles.backButtonTextSmall}>← Change Role</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  roleButton: {
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  signupButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonSmall: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonTextSmall: {
    color: '#94a3b8',
    fontSize: 14,
  },
});