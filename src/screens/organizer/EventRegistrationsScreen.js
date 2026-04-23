import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { listenEventRegistrations } from '../../services/eventService';

export default function EventRegistrationsScreen({ route }) {
  const { eventId, eventTitle } = route.params;
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenEventRegistrations(eventId, (data) => {
      setRegistrations(data);
      setLoading(false);
    });
    return unsub;
  }, [eventId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1b5e20" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>{eventTitle}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{registrations.length} Registered</Text>
        </View>
      </View>

      <FlatList
        data={registrations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No Registrations Yet</Text>
            <Text style={styles.emptySubtitle}>Students who register will appear here.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {item.studentName?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.studentName}</Text>
              {item.matricNumber ? (
                <Text style={styles.cardMeta}>Matric: {item.matricNumber}</Text>
              ) : null}
              {item.department ? (
                <Text style={styles.cardMeta}>{item.department}</Text>
              ) : null}
              {item.studentEmail ? (
                <Text style={styles.cardEmail}>{item.studentEmail}</Text>
              ) : null}
            </View>
            <View style={styles.indexBadge}>
              <Text style={styles.indexText}>#{index + 1}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#1b5e20', padding: 16, paddingTop: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: '700', flex: 1, marginRight: 10 },
  countBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  countText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  list: { padding: 14, gap: 10 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', elevation: 2,
  },
  avatarCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#1b5e20' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#212121', marginBottom: 2 },
  cardMeta: { fontSize: 12, color: '#757575', marginBottom: 1 },
  cardEmail: { fontSize: 12, color: '#1565C0' },
  indexBadge: {
    backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 8,
    paddingVertical: 4, marginLeft: 8,
  },
  indexText: { fontSize: 12, color: '#9e9e9e', fontWeight: '700' },
  emptyContainer: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#424242', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#9e9e9e', textAlign: 'center', paddingHorizontal: 30 },
});
