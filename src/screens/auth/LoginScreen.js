import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
  ScrollView, Image,
} from 'react-native';
import { signIn } from '../../services/authService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // AuthContext picks up the auth state change and routes to the correct screen
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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../../assets/logo-rounded.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>Sign in to your EMS account</Text>

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
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
              placeholder="Enter password"
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
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.signUpBtn}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.signUpText}>
              Don't have an account? <Text style={styles.signUpBold}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          UniEvents — Trinity University v1.0
        </Text>

        <TouchableOpacity
          style={styles.adminPortalBtn}
          onPress={() => navigation.navigate('AdminLogin')}
        >
          <Text style={styles.adminPortalText}>Administrator Portal</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const TU_BLUE = '#1B2A6B';
const TU_RED  = '#C0392B';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TU_BLUE },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 28 },
  logo: { width: 180, height: 120 },
  card: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: 28, elevation: 10,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#888', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#f5f6fa', borderRadius: 10,
    padding: 13, fontSize: 15, color: '#1a1a2e',
    borderWidth: 1.5, borderColor: '#e8e8e8',
  },
  passRow: { flexDirection: 'row', alignItems: 'center' },
  passInput: { flex: 1 },
  eyeBtn: { position: 'absolute', right: 12, padding: 4 },
  eyeText: { fontSize: 18 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 4 },
  forgotText: { color: TU_BLUE, fontSize: 13, fontWeight: '600' },
  loginBtn: {
    backgroundColor: TU_BLUE, borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 20,
    elevation: 3,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: '#eee' },
  dividerText: { marginHorizontal: 12, color: '#bbb', fontSize: 13 },
  signUpBtn: { alignItems: 'center' },
  signUpText: { color: '#888', fontSize: 14 },
  signUpBold: { color: TU_RED, fontWeight: '800' },
  footer: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 24 },
  adminPortalBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 6 },
  adminPortalText: { color: 'rgba(255,255,255,0.25)', fontSize: 11, textDecorationLine: 'underline' },
});
