import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native';
import { signUp } from '../../services/authService';
import { ROLES } from '../../config/firebase';

const ROLE_OPTIONS = [
  { label: '🎓  Student', value: ROLES.STUDENT, desc: 'Browse & register for events' },
  { label: '📋  Organizer', value: ROLES.ORGANIZER, desc: 'Create & manage events' },
];

const TU_BLUE = '#1B2A6B';
const TU_RED  = '#C0392B';

export default function SignUpScreen({ navigation }) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [role, setRole]               = useState(ROLES.STUDENT);
  const [loading, setLoading]         = useState(false);
  const [showPass, setShowPass]       = useState(false);

  async function handleSignUp() {
    if (!displayName.trim() || !email.trim() || !password || !confirm) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password Mismatch', 'Your passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim(), role);
      Alert.alert(
        '✅ Account Created!',
        'Your account is ready. You can now sign in.',
        [{ text: 'Sign In', onPress: () => navigation.navigate('Login') }],
      );
    } catch (error) {
      const msg = error.code === 'auth/email-already-in-use'
        ? 'This email is already registered. Please sign in instead.'
        : error.message;
      Alert.alert('Sign Up Failed', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Image
          source={require('../../../assets/logo-rounded.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create Account</Text>
        <Text style={styles.cardSubtitle}>Join the TU Events community</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} placeholder="e.g. Adaeze Okonkwo" placeholderTextColor="#aaa" value={displayName} onChangeText={setDisplayName} />

        <Text style={styles.label}>Email Address</Text>
        <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="#aaa" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passRow}>
          <TextInput style={[styles.input, styles.passInput]} placeholder="Min. 6 characters" placeholderTextColor="#aaa" value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
            <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput style={styles.input} placeholder="Re-enter password" placeholderTextColor="#aaa" value={confirm} onChangeText={setConfirm} secureTextEntry={!showPass} />

        <Text style={styles.label}>I am registering as:</Text>
        <View style={styles.roleRow}>
          {ROLE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.roleCard, role === opt.value && styles.roleCardActive]}
              onPress={() => setRole(opt.value)}
            >
              <Text style={[styles.roleLabel, role === opt.value && styles.roleLabelActive]}>
                {opt.label}
              </Text>
              <Text style={[styles.roleDesc, role === opt.value && styles.roleDescActive]}>
                {opt.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.goBack()}>
          <Text style={styles.loginLinkText}>
            Already have an account? <Text style={styles.loginBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TU_BLUE },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 48, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 160, height: 110 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, elevation: 10 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#888', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#f5f6fa', borderRadius: 10,
    padding: 13, fontSize: 15, color: '#1a1a2e',
    borderWidth: 1.5, borderColor: '#e8e8e8',
  },
  passRow: { flexDirection: 'row', alignItems: 'center' },
  passInput: { flex: 1 },
  eyeBtn: { position: 'absolute', right: 12, padding: 4 },
  eyeText: { fontSize: 18 },
  roleRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  roleCard: {
    flex: 1, borderWidth: 2, borderColor: '#e8e8e8',
    borderRadius: 12, padding: 12, alignItems: 'center',
  },
  roleCardActive: { borderColor: TU_BLUE, backgroundColor: '#eef0f8' },
  roleLabel: { fontSize: 14, fontWeight: '700', color: '#999', marginBottom: 4 },
  roleLabelActive: { color: TU_BLUE },
  roleDesc: { fontSize: 11, color: '#bbb', textAlign: 'center' },
  roleDescActive: { color: '#666' },
  btn: {
    backgroundColor: TU_BLUE, borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 24, elevation: 3,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  loginLink: { alignItems: 'center', marginTop: 18 },
  loginLinkText: { color: '#888', fontSize: 14 },
  loginBold: { color: TU_RED, fontWeight: '800' },
});
