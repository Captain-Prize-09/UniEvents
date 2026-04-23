/**
 * AdminDashboardScreen.js
 * High-level stats: total events by status + total registrations.
 * Real-time via Firestore listener.
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity,
} from 'react-native';
import { listenAllEvents } from '../../services/eventService';
import { EVENT_STATUS } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from '../../services/authService';

export default function AdminDashboardScreen() {
  const { profile } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenAllEvents((data) => {
      setEvents(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const pending  = events.filter((e) => e.status === EVENT_STATUS.PENDING).length;
  const approved = events.filter((e) => e.status === EVENT_STATUS.APPROVED).length;
  const rejected = events.filter((e) => e.status === EVENT_STATUS.REJECTED).length;
  const totalRegistrations = events.reduce((sum, e) => sum + (e.registrationCount ?? 0), 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#b71c1c" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.name}>{profile?.displayName ?? 'Administrator'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => signOut()}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Event Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard label="Total Events" value={events.length} color="#1a237e" />
        <StatCard label="Pending" value={pending} color="#f57f17" />
        <StatCard label="Approved" value={approved} color="#2e7d32" />
        <StatCard label="Rejected" value={rejected} color="#c62828" />
      </View>

      <Text style={styles.sectionTitle}>Participation</Text>
      <View style={styles.bigStat}>
        <Text style={styles.bigStatValue}>{totalRegistrations}</Text>
        <Text style={styles.bigStatLabel}>Total Registrations Across All Events</Text>
      </View>

      {approved > 0 && (
        <>
          <Text style={styles.sectionTitle}>Top Registered Events</Text>
          {events
            .filter((e) => e.status === EVENT_STATUS.APPROVED)
            .sort((a, b) => (b.registrationCount ?? 0) - (a.registrationCount ?? 0))
            .slice(0, 5)
            .map((e) => (
              <View key={e.id} style={styles.topCard}>
                <Text style={styles.topTitle} numberOfLines={1}>{e.title}</Text>
                <Text style={styles.topCount}>{e.registrationCount ?? 0} registered</Text>
              </View>
            ))}
        </>
      )}
    </ScrollView>
  );
}

function StatCard({ label, value, color }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  welcome: { fontSize: 13, color: '#757575' },
  name: { fontSize: 20, fontWeight: '800', color: '#212121' },
  logoutBtn: {
    borderWidth: 1.5, borderColor: '#c62828', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  logoutText: { color: '#c62828', fontWeight: '700', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#424242', marginBottom: 12, marginTop: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 12,
    padding: 16, borderLeftWidth: 4, elevation: 2,
  },
  statValue: { fontSize: 30, fontWeight: '800' },
  statLabel: { fontSize: 13, color: '#757575', marginTop: 4, fontWeight: '600' },
  bigStat: {
    backgroundColor: '#fff', borderRadius: 14, padding: 24,
    alignItems: 'center', elevation: 2, marginBottom: 24,
  },
  bigStatValue: { fontSize: 48, fontWeight: '800', color: '#1a237e' },
  bigStatLabel: { fontSize: 14, color: '#757575', marginTop: 6, textAlign: 'center' },
  topCard: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8, elevation: 1,
  },
  topTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: '#212121', marginRight: 8 },
  topCount: { fontSize: 13, color: '#1a237e', fontWeight: '700' },
});
