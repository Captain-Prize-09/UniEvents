import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { listenOrganizerEvents } from "../../services/eventService";
import { EVENT_STATUS } from "../../config/firebase";

const STATUS_COLORS = {
  [EVENT_STATUS.PENDING]: { bg: "#fff8e1", text: "#f57f17" },
  [EVENT_STATUS.APPROVED]: { bg: "#e8f5e9", text: "#2e7d32" },
  [EVENT_STATUS.REJECTED]: { bg: "#ffebee", text: "#c62828" },
};

export default function OrganizerDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenOrganizerEvents(user.uid, (data) => {
      setEvents(data);
      setLoading(false);
    });
    return unsub;
  }, [user.uid]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1b5e20" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        {[
          EVENT_STATUS.PENDING,
          EVENT_STATUS.APPROVED,
          EVENT_STATUS.REJECTED,
        ].map((s) => (
          <View
            key={s}
            style={[styles.statCard, { backgroundColor: STATUS_COLORS[s].bg }]}
          >
            <Text style={[styles.statCount, { color: STATUS_COLORS[s].text }]}>
              {events.filter((e) => e.status === s).length}
            </Text>
            <Text style={[styles.statLabel, { color: STATUS_COLORS[s].text }]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </View>
        ))}
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              No events yet.{"\n"}Tap ➕ Create to add your first event!
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const colors =
            STATUS_COLORS[item.status] ?? STATUS_COLORS[EVENT_STATUS.PENDING];
          return (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardPressable}
                onPress={() =>
                  navigation.navigate("EditEvent", { event: item })
                }
              >
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.cardThumbnail}
                  />
                ) : (
                  <View
                    style={[styles.cardThumbnail, styles.placeholderThumbnail]}
                  >
                    <Text style={styles.placeholderEmoji}>🎉</Text>
                  </View>
                )}
                <View style={styles.cardInfo}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View
                      style={[styles.badge, { backgroundColor: colors.bg }]}
                    >
                      <Text style={[styles.badgeText, { color: colors.text }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardMeta}>
                    {item.date} • {item.location}
                  </Text>
                  {item.adminNote ? (
                    <Text style={styles.adminNote}>
                      Admin note: {item.adminNote}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() =>
                    navigation.navigate("EventRegistrations", {
                      eventId: item.id,
                      eventTitle: item.title,
                    })
                  }
                >
                  <Text style={styles.actionIcon}>👥</Text>
                  <Text style={styles.actionLabel}>
                    {item.registrationCount ?? 0} Registered
                  </Text>
                </TouchableOpacity>

                <View style={styles.actionDivider} />

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() =>
                    navigation.navigate("EventFeedback", {
                      eventId: item.id,
                      eventTitle: item.title,
                    })
                  }
                >
                  <Text style={styles.actionIcon}>💬</Text>
                  <Text style={styles.actionLabel}>Feedback</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  statsRow: { flexDirection: "row", padding: 14, gap: 10 },
  statCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center" },
  statCount: { fontSize: 28, fontWeight: "800" },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: 2,
  },
  list: { padding: 14, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    overflow: "hidden",
  },
  cardPressable: { flexDirection: "row", alignItems: "center" },
  cardThumbnail: { width: 80, height: 80, borderRadius: 8, margin: 12 },
  placeholderThumbnail: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderEmoji: { fontSize: 24 },
  cardInfo: { flex: 1, paddingRight: 12 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
    flex: 1,
    marginRight: 8,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  cardMeta: { fontSize: 13, color: "#757575", paddingBottom: 8 },
  adminNote: {
    fontSize: 12,
    color: "#c62828",
    paddingBottom: 8,
    fontStyle: "italic",
  },
  cardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 6,
  },
  actionDivider: { width: 1, backgroundColor: "#f0f0f0" },
  actionIcon: { fontSize: 16 },
  actionLabel: { fontSize: 13, fontWeight: "700", color: "#1b5e20" },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: {
    color: "#9e9e9e",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
