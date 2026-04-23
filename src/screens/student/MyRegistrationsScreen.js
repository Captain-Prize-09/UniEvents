import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { listenStudentRegistrations } from '../../services/eventService';
import { db, COLLECTIONS } from '../../config/firebase';
import { getDoc, doc } from 'firebase/firestore';

export default function MyRegistrationsScreen({ navigation }) {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenStudentRegistrations(user.uid, async (regs) => {
      setRegistrations(regs);
      const eventMap = {};
      await Promise.all(
        regs.map(async (reg) => {
          const snap = await getDoc(doc(db, COLLECTIONS.EVENTS, reg.eventId));
          if (snap.exists()) eventMap[reg.eventId] = { id: snap.id, ...snap.data() };
        }),
      );
      setEvents(eventMap);
      setLoading(false);
    });
    return unsub;
  }, [user.uid]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a237e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={registrations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎟️</Text>
            <Text style={styles.emptyTitle}>No Registrations Yet</Text>
            <Text style={styles.emptySub}>Browse events and tap Register to sign up.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const event = events[item.eventId];
          if (!event) return null;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Browse', {
                screen: 'EventDetail',
                params: { event },
              })}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle} numberOfLines={1}>{event.title}</Text>
                <Text style={styles.cardMeta}>{event.date}  •  {event.location}</Text>
                <Text style={styles.cardCategory}>{event.category ?? 'General'}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.registeredBadge}>Registered ✓</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  list: { padding: 14, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    flexDirection: 'row', elevation: 2, alignItems: 'center',
  },
  cardLeft: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#212121', marginBottom: 4 },
  cardMeta: { fontSize: 13, color: '#757575', marginBottom: 4 },
  cardCategory: { fontSize: 12, color: '#1B2A6B', fontWeight: '600' },
  cardRight: { marginLeft: 12 },
  registeredBadge: {
    backgroundColor: '#e8f5e9', color: '#2e7d32',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    fontSize: 12, fontWeight: '700', overflow: 'hidden',
  },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#888', textAlign: 'center', paddingHorizontal: 30 },
});
