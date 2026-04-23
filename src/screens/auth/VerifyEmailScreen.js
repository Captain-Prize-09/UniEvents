import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { auth } from '../../config/firebase';
import { resendVerificationEmail, signOut } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

export default function VerifyEmailScreen() {
  const { refreshUser } = useAuth();
  const [resending, setResending] = useState(false);
  const [checking, setChecking]   = useState(false);

  async function handleCheckVerified() {
    setChecking(true);
    try {
      await auth.currentUser.reload();

      if (auth.currentUser.emailVerified) {
        // Trigger AuthContext to re-load profile and re-route
        await refreshUser();
      } else {
        Alert.alert(
          'Not Verified Yet',
          'We could not confirm your verification. Please click the link in your email first.\n\nAlso check your spam/junk folder.',
        );
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setChecking(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await resendVerificationEmail();
      Alert.alert(
        'Email Sent',
        'A new verification link has been sent.\n\nIf you don\'t see it, check your spam/junk folder and mark it as "Not Spam".',
      );
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>✉️</Text>
      </View>

      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        A verification link was sent to:{'\n'}
        <Text style={styles.email}>{auth.currentUser?.email}</Text>
      </Text>

      <View style={styles.stepsBox}>
        <Text style={styles.stepsTitle}>Steps to verify:</Text>
        <Text style={styles.step}>1. Open your email inbox</Text>
        <Text style={styles.step}>2. Check spam/junk if not in inbox</Text>
        <Text style={styles.step}>3. Click the verification link</Text>
        <Text style={styles.step}>4. Come back and tap the button below</Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, checking && styles.btnDisabled]}
        onPress={handleCheckVerified}
        disabled={checking}
      >
        {checking ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryBtnText}>✅  I've Verified My Email</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryBtn, resending && styles.btnDisabled]}
        onPress={handleResend}
        disabled={resending}
      >
        {resending ? (
          <ActivityIndicator color="#1B2A6B" />
        ) : (
          <Text style={styles.secondaryBtnText}>Resend Verification Email</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#f0f2f5',
    justifyContent: 'center', alignItems: 'center', padding: 28,
  },
  iconCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#e8eaf6', justifyContent: 'center',
    alignItems: 'center', marginBottom: 20,
  },
  iconText: { fontSize: 42 },
  title: { fontSize: 24, fontWeight: '800', color: '#1B2A6B', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  email: { fontWeight: '800', color: '#1B2A6B' },
  stepsBox: {
    backgroundColor: '#fff', borderRadius: 14, padding: 18,
    width: '100%', marginBottom: 28, elevation: 2,
    borderLeftWidth: 4, borderLeftColor: '#1B2A6B',
  },
  stepsTitle: { fontWeight: '800', color: '#1B2A6B', marginBottom: 10, fontSize: 14 },
  step: { color: '#555', fontSize: 13, marginBottom: 6, lineHeight: 20 },
  primaryBtn: {
    backgroundColor: '#1B2A6B', borderRadius: 12,
    padding: 16, width: '100%', alignItems: 'center', marginBottom: 12,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  secondaryBtn: {
    borderWidth: 2, borderColor: '#1B2A6B', borderRadius: 12,
    padding: 14, width: '100%', alignItems: 'center', marginBottom: 24,
  },
  secondaryBtnText: { color: '#1B2A6B', fontSize: 15, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
  signOutBtn: { padding: 10 },
  signOutText: { color: '#C0392B', fontSize: 14, fontWeight: '600' },
});
