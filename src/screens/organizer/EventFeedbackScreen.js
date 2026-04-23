import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
} from 'react-native';
import { listenEventFeedback } from '../../services/eventService';

function StarRow({ rating }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={[styles.star, { opacity: i <= rating ? 1 : 0.25 }]}>★</Text>
      ))}
    </View>
  );
}

export default function EventFeedbackScreen({ route }) {
  const { eventId, eventTitle } = route.params;
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenEventFeedback(eventId, (data) => {
      setFeedbacks(data);
      setLoading(false);
    });
    return unsub;
  }, [eventId]);

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((sum, f) => sum + (f.rating ?? 0), 0) / feedbacks.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1b5e20" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle} numberOfLines={1}>{eventTitle}</Text>
        {avgRating ? (
          <View style={styles.avgRow}>
            <Text style={styles.avgNumber}>{avgRating}</Text>
            <Text style={styles.avgStar}>★</Text>
            <Text style={styles.avgLabel}> / 5   ({feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''})</Text>
          </View>
        ) : (
          <Text style={styles.noFeedback}>No feedback yet</Text>
        )}
      </View>

      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No Feedback Yet</Text>
            <Text style={styles.emptySubtitle}>Students who attended can leave feedback after the event.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {item.studentName?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.studentName}>{item.studentName}</Text>
                <StarRow rating={item.rating} />
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingNumber}>{item.rating}</Text>
                <Text style={styles.ratingStar}>★</Text>
              </View>
            </View>
            {item.comment ? (
              <Text style={styles.comment}>"{item.comment}"</Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryCard: {
    backgroundColor: '#1b5e20', padding: 20, margin: 14,
    borderRadius: 16, elevation: 4,
  },
  summaryTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 10 },
  avgRow: { flexDirection: 'row', alignItems: 'baseline' },
  avgNumber: { fontSize: 36, fontWeight: '900', color: '#fff' },
  avgStar: { fontSize: 24, color: '#ffd600', marginLeft: 4 },
  avgLabel: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginLeft: 4 },
  noFeedback: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  list: { paddingHorizontal: 14, paddingBottom: 20, gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  avatarText: { fontSize: 17, fontWeight: '800', color: '#1b5e20' },
  cardMeta: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: '700', color: '#212121', marginBottom: 3 },
  starRow: { flexDirection: 'row' },
  star: { fontSize: 14, color: '#ffd600' },
  ratingBadge: {
    backgroundColor: '#fff8e1', borderRadius: 10, paddingHorizontal: 8,
    paddingVertical: 5, flexDirection: 'row', alignItems: 'center',
  },
  ratingNumber: { fontSize: 16, fontWeight: '800', color: '#f57f17' },
  ratingStar: { fontSize: 13, color: '#ffd600', marginLeft: 2 },
  comment: {
    fontSize: 13, color: '#555', fontStyle: 'italic',
    lineHeight: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8,
  },
  emptyContainer: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#424242', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#9e9e9e', textAlign: 'center', paddingHorizontal: 30 },
});
