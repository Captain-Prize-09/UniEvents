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
import { listenAllEvents } from "../../services/eventService";
import { EVENT_STATUS } from "../../config/firebase";

export default function PendingEventsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(EVENT_STATUS.PENDING);

  useEffect(() => {
    const unsub = listenAllEvents((data) => {
      setEvents(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const displayed = events.filter((e) => e.status === filter);

  const FILTERS = [
    { label: "Pending", value: EVENT_STATUS.PENDING, color: "#f57f17" },
    { label: "Approved", value: EVENT_STATUS.APPROVED, color: "#2e7d32" },
    { label: "Rejected", value: EVENT_STATUS.REJECTED, color: "#c62828" },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#b71c1c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.filterBtn,
              filter === f.value && { backgroundColor: f.color },
            ]}
            onPress={() => setFilter(f.value)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.value && styles.filterTextActive,
              ]}
            >
              {f.label} ({events.filter((e) => e.status === f.value).length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No {filter} events.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("EventReview", { event: item })}
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.cardThumbnail}
              />
            ) : (
              <View style={[styles.cardThumbnail, styles.placeholderThumbnail]}>
                <Text style={styles.placeholderEmoji}>🎉</Text>
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.cardMeta}>
                {item.date} • {item.location}
              </Text>
              <Text style={styles.cardCategory}>
                {item.category ?? "General"}
              </Text>
              <Text style={styles.cardRegistrations}>
                {item.registrationCount ?? 0} registered
              </Text>
            </View>
          </TouchableOpacity>
        )}
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
  filterRow: { flexDirection: "row", padding: 14, gap: 8 },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    elevation: 1,
  },
  filterText: { fontSize: 12, fontWeight: "700", color: "#757575" },
  filterTextActive: { color: "#fff" },
  list: { padding: 14, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  cardThumbnail: { width: 70, height: 70, borderRadius: 8, marginRight: 12 },
  placeholderThumbnail: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderEmoji: { fontSize: 24 },
  cardInfo: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 4,
  },
  cardMeta: { fontSize: 13, color: "#757575", marginBottom: 2 },
  cardCategory: {
    fontSize: 12,
    color: "#1a237e",
    fontWeight: "600",
    marginBottom: 2,
  },
  cardRegistrations: { fontSize: 12, color: "#2e7d32", fontWeight: "600" },
  emptyText: { color: "#9e9e9e", fontSize: 15 },
});
