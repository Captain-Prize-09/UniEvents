/**
 * EventDetailScreen.js
 * Full event info with one-tap registration/cancellation.
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import {
  registerForEvent,
  cancelRegistration,
  isRegistered,
} from "../../services/eventService";

export default function EventDetailScreen({ route, navigation }) {
  const { event } = route.params;
  const { user } = useAuth();
  const [registered, setRegistered] = useState(false);
  const [loadingReg, setLoadingReg] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) {
      setLoadingReg(false);
      return;
    }
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setLoadingReg(false);
      }
    }, 8000);
    isRegistered(uid, event.id)
      .then((val) => {
        clearTimeout(timeout);
        if (!cancelled) {
          setRegistered(val);
          setLoadingReg(false);
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        if (!cancelled) setLoadingReg(false);
      });
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [user?.uid, event.id]);

  async function handleToggleRegistration() {
    setSubmitting(true);
    try {
      if (registered) {
        await cancelRegistration(user.uid, event.id);
        setRegistered(false);
        Alert.alert("Cancelled", "Your registration has been cancelled.");
      } else {
        await registerForEvent(user.uid, event.id);
        setRegistered(true);
        Alert.alert("Registered!", `You're registered for "${event.title}".`);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  }

  const isFull = event.capacity && event.registrationCount >= event.capacity;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{event.category ?? "General"}</Text>
        </View>

        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Date & Time</Text>
          <Text style={styles.metaValue}>
            {event.date} {event.time}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Location</Text>
          <Text style={styles.metaValue}>{event.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Registered</Text>
          <Text style={styles.metaValue}>
            {event.registrationCount ?? 0}
            {event.capacity ? ` / ${event.capacity}` : ""}
          </Text>
        </View>

        <Text style={styles.sectionHeader}>About this Event</Text>
        <Text style={styles.description}>{event.description}</Text>

        {loadingReg ? (
          <ActivityIndicator color="#1a237e" style={{ marginTop: 20 }} />
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.regBtn,
                registered && styles.regBtnCancel,
                isFull && !registered && styles.regBtnFull,
                submitting && styles.regBtnDisabled,
              ]}
              onPress={handleToggleRegistration}
              disabled={submitting || (isFull && !registered)}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.regBtnText}>
                  {registered
                    ? "Cancel Registration"
                    : isFull
                      ? "Event Full"
                      : "Register Now"}
                </Text>
              )}
            </TouchableOpacity>

            {registered && (
              <TouchableOpacity
                style={styles.feedbackBtn}
                onPress={() => navigation.navigate("Feedback", { event })}
              >
                <Text style={styles.feedbackText}>Submit Feedback</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { paddingBottom: 40 },
  image: { width: "100%", height: 220 },
  imagePlaceholder: {
    backgroundColor: "#e8eaf6",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: { color: "#9e9e9e" },
  body: { padding: 20 },
  categoryBadge: {
    backgroundColor: "#e8eaf6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  categoryText: {
    color: "#1a237e",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#212121",
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  metaLabel: { color: "#9e9e9e", fontSize: 13, fontWeight: "600" },
  metaValue: {
    color: "#424242",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
    marginTop: 20,
    marginBottom: 8,
  },
  description: { fontSize: 14, color: "#616161", lineHeight: 22 },
  regBtn: {
    backgroundColor: "#1a237e",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  regBtnCancel: { backgroundColor: "#c62828" },
  regBtnFull: { backgroundColor: "#9e9e9e" },
  regBtnDisabled: { opacity: 0.6 },
  regBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  feedbackBtn: {
    borderWidth: 2,
    borderColor: "#1a237e",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  feedbackText: { color: "#1a237e", fontSize: 15, fontWeight: "700" },
});
