import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../services/authService';
import { auth } from '../../config/firebase';

const DEPARTMENTS = [
  'Computer & Information Sciences', 'Economics', 'English & Literary Studies',
  'Mass Communication', 'Management Sciences', 'Political Science',
  'Biological Sciences', 'Medical Laboratory Science', 'Physics with Electronics',
  'Nursing Science',
];

export default function EditProfileScreen({ navigation }) {
  const { profile, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [matricNumber, setMatricNumber] = useState(profile?.matricNumber ?? '');
  const [department, setDepartment] = useState(profile?.department ?? '');
  const [loading, setLoading] = useState(false);
  const [showDeptPicker, setShowDeptPicker] = useState(false);

  async function handleSave() {
    if (!displayName.trim()) {
      Alert.alert('Required', 'Full name cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      await updateUserProfile(profile.uid, {
        displayName: displayName.trim(),
        matricNumber: matricNumber.trim(),
        department,
      });
      await refreshUser();
      Alert.alert('Saved!', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.headerSection}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarInitial}>{displayName?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.headerName}>{displayName || 'Your Name'}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} placeholder="Your full name" placeholderTextColor="#aaa" />

        <Text style={styles.label}>Matric Number</Text>
        <TextInput style={styles.input} value={matricNumber} onChangeText={setMatricNumber} placeholder="e.g. 202500001" placeholderTextColor="#aaa" />

        <Text style={styles.label}>Department</Text>
        <TouchableOpacity style={styles.deptSelector} onPress={() => setShowDeptPicker(!showDeptPicker)}>
          <Text style={[styles.deptSelectorText, !department && { color: '#aaa' }]}>
            {department || 'Select your department'}
          </Text>
          <Text>{showDeptPicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showDeptPicker && (
          <View style={styles.deptList}>
            {DEPARTMENTS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.deptItem, department === d && styles.deptItemActive]}
                onPress={() => { setDepartment(d); setShowDeptPicker(false); }}
              >
                <Text style={[styles.deptItemText, department === d && styles.deptItemTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { paddingBottom: 40 },
  headerSection: { backgroundColor: '#1B2A6B', alignItems: 'center', paddingVertical: 28 },
  avatarBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarInitial: { fontSize: 32, fontWeight: '900', color: '#1B2A6B' },
  headerName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  form: { padding: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15, color: '#1a1a2e', borderWidth: 1.5, borderColor: '#e8e8e8' },
  deptSelector: { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: '#e8e8e8' },
  deptSelectorText: { fontSize: 15, color: '#1a1a2e' },
  deptList: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: '#e8e8e8', marginTop: 4, overflow: 'hidden' },
  deptItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  deptItemActive: { backgroundColor: '#eef0f8' },
  deptItemText: { fontSize: 14, color: '#444' },
  deptItemTextActive: { color: '#1B2A6B', fontWeight: '700' },
  saveBtn: { backgroundColor: '#1B2A6B', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 28, elevation: 3 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
