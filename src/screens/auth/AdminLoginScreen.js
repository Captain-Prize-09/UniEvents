import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { signIn, signOut } from '../../services/authService';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS, ROLES } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const TU_BLUE = '#1B2A6B';
const TU_RED  = '#C0392B';

export default function AdminLoginScreen({ navigation }) {
  const { refreshUser, forceRole } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleAdminLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please enter your admin email and password.');
      return;
    }
    setLoading(true);
    try {
      const user = await signIn(email.trim(), password);

      // Check Firestore for admin role
      const userRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // First-time admin setup — create document without student-specific fields
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName ?? 'Administrator',
          role: ROLES.ADMIN,
          createdAt: serverTimestamp(),
        });
      } else if (userSnap.data().role !== ROLES.ADMIN) {
        await signOut();
        Alert.alert('Access Denied', 'This account does not have administrator privileges.');
        return;
      }

      // Set role immediately to prevent race condition with onAuthStateChanged
      forceRole(ROLES.ADMIN);
      await refreshUser();
    } catch (error) {
      const msg = error.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : error.message;
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Image
          source={require('../../../assets/logo-rounded.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Admin Badge */}
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>🛡️  ADMINISTRATOR PORTAL</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Admin Sign In</Text>
          <Text style={styles.cardSubtitle}>
            Restricted access — authorised personnel only
          </Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️  This portal is for system administrators only.
              Unauthorised access attempts are logged.
            </Text>
          </View>

          <Text style={styles.label}>Admin Email</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@trinityuniversity.edu.ng"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.input, styles.passInput]}
              placeholder="Enter admin password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
              <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleAdminLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Access Admin Dashboard</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b4b' },
  backBtn: { position: 'absolute', top: 48, left: 20, zIndex: 10, padding: 8 },
  backText: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '600' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  logo: { width: 160, height: 100, marginBottom: 16 },
  adminBadge: {
    backgroundColor: TU_RED, borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 7, marginBottom: 24,
  },
  adminBadgeText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    width: '100%', elevation: 12,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#888', marginBottom: 16 },
  warningBox: {
    backgroundColor: '#fff8e1', borderRadius: 10, padding: 12,
    borderLeftWidth: 4, borderLeftColor: '#f57f17', marginBottom: 20,
  },
  warningText: { color: '#7a5400', fontSize: 12, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#f5f6fa', borderRadius: 10, padding: 13,
    fontSize: 15, color: '#1a1a2e', borderWidth: 1.5, borderColor: '#e8e8e8',
  },
  passRow: { flexDirection: 'row', alignItems: 'center' },
  passInput: { flex: 1 },
  eyeBtn: { position: 'absolute', right: 12, padding: 4 },
  eyeText: { fontSize: 18 },
  loginBtn: {
    backgroundColor: TU_RED, borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 24, elevation: 3,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
