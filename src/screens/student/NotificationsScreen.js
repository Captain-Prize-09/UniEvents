import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { listenNotifications, markNotificationRead } from '../../services/notificationService';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenNotifications(user.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    });
    return unsub;
  }, [user.uid]);

  async function handleTap(notif) {
    if (!notif.read) await markNotificationRead(notif.id);
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1B2A6B" /></View>;
  }

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>🔔 {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔕</Text>
            <Text style={styles.emptyTitle}>No Notifications Yet</Text>
            <Text style={styles.emptySub}>You'll be notified when new events are approved, or when events are about to start.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.read && styles.cardUnread]}
            onPress={() => handleTap(item)}
            activeOpacity={0.85}
          >
            <View style={styles.iconBox}>
              <Text style={styles.icon}>{getIcon(item.data?.status)}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody2} numberOfLines={2}>{item.body}</Text>
              <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function getIcon(status) {
  if (status === 'approved') return '✅';
  if (status === 'rejected') return '❌';
  if (status === 'reminder') return '⏰';
  return '🔔';
}

function formatTime(ts) {
  if (!ts?.seconds) return '';
  const date = new Date(ts.seconds * 1000);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  unreadBanner: {
    backgroundColor: '#1B2A6B', padding: 12, alignItems: 'center',
  },
  unreadText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  list: { padding: 14, gap: 10, paddingBottom: 30 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', elevation: 2,
  },
  cardUnread: { borderLeftWidth: 4, borderLeftColor: '#1B2A6B' },
  iconBox: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#f0f2f5', justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  icon: { fontSize: 22 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#1a1a2e', marginBottom: 3 },
  cardBody2: { fontSize: 13, color: '#666', lineHeight: 18 },
  time: { fontSize: 11, color: '#aaa', marginTop: 5 },
  unreadDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#1B2A6B', marginLeft: 8,
  },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 30 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },
});
