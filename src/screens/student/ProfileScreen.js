import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, ScrollView, Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from '../../services/authService';

const DEPARTMENTS = [
  'Computer & Information Sciences', 'Economics', 'English & Literary Studies',
  'Mass Communication', 'Management Sciences', 'Political Science',
  'Biological Sciences', 'Medical Laboratory Science', 'Physics with Electronics',
  'Nursing Science',
];

export default function ProfileScreen({ navigation }) {
  const { profile } = useAuth();

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarBox}>
          {profile?.photoURL ? (
            <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
          ) : (
            <Text style={styles.avatarInitial}>
              {profile?.displayName?.[0]?.toUpperCase() ?? '?'}
            </Text>
          )}
        </View>
        <Text style={styles.name}>{profile?.displayName ?? 'Student'}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        {profile?.department ? (
          <View style={styles.deptBadge}>
            <Text style={styles.deptText}>{profile.department}</Text>
          </View>
        ) : null}
      </View>

      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Details</Text>
        <InfoRow icon="🎓" label="Matric Number" value={profile?.matricNumber || 'Not set'} />
        <InfoRow icon="🏛️" label="Department" value={profile?.department || 'Not set'} />
        <InfoRow icon="📧" label="Email" value={profile?.email} />
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Text style={styles.editBtnText}>✏️  Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { paddingBottom: 40 },
  avatarSection: {
    backgroundColor: '#1B2A6B', alignItems: 'center',
    paddingVertical: 32, paddingHorizontal: 20,
  },
  avatarBox: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#fff', justifyContent: 'center',
    alignItems: 'center', marginBottom: 14, elevation: 4,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarInitial: { fontSize: 36, fontWeight: '900', color: '#1B2A6B' },
  name: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 10 },
  deptBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5,
  },
  deptText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  section: {
    backgroundColor: '#fff', margin: 14, borderRadius: 16,
    padding: 16, elevation: 2,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#1B2A6B', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  infoIcon: { fontSize: 20, marginRight: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#aaa', fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 15, color: '#1a1a2e', fontWeight: '600' },
  editBtn: {
    backgroundColor: '#1B2A6B', marginHorizontal: 14,
    borderRadius: 14, padding: 16, alignItems: 'center', elevation: 3,
  },
  editBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  signOutBtn: {
    margin: 14, borderWidth: 2, borderColor: '#C0392B',
    borderRadius: 14, padding: 15, alignItems: 'center',
  },
  signOutText: { color: '#C0392B', fontWeight: '800', fontSize: 15 },
});
