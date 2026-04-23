/**
 * EventReviewScreen.js
 * Admin can read full event details, leave a note, then Approve or Reject.
 * After action, triggers a Firestore notification record for the organizer.
 */

import React, { useState } from 'react';
import {
  View, Text, ScrollView, Image, TextInput,
  TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { setEventStatus } from '../../services/eventService';
import { storeNotification } from '../../services/notificationService';
import { EVENT_STATUS } from '../../config/firebase';

export default function EventReviewScreen({ route, navigation }) {
  const { event } = route.params;
  const [note, setNote] = useState(event.adminNote ?? '');
  const [loading, setLoading] = useState(false);

  async function handleDecision(status) {
    const action = status === EVENT_STATUS.APPROVED ? 'approve' : 'reject';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Event`,
      `Are you sure you want to ${action} "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: status === EVENT_STATUS.REJECTED ? 'destructive' : 'default',
          onPress: async () => {
            setLoading(true);
            try {
              await setEventStatus(event.id, status, note.trim());

              // Notify the organizer via Firestore notification record
              await storeNotification(
                event.organizerUid,
                status === EVENT_STATUS.APPROVED
                  ? `Event Approved: ${event.title}`
                  : `Event Rejected: ${event.title}`,
                note.trim() || (status === EVENT_STATUS.APPROVED
                  ? 'Your event has been approved and is now live!'
                  : 'Your event proposal was not approved.'),
                { eventId: event.id, status },
              );

              Alert.alert('Done', `Event has been ${status}.`, [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  }

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
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Current Status:</Text>
          <StatusBadge status={event.status} />
        </View>

        <Text style={styles.title}>{event.title}</Text>

        <InfoRow label="Date" value={`${event.date}  ${event.time ?? ''}`} />
        <InfoRow label="Location" value={event.location} />
        <InfoRow label="Category" value={event.category ?? 'General'} />
        <InfoRow label="Capacity" value={event.capacity ? `${event.capacity} seats` : 'Unlimited'} />
        <InfoRow label="Registrations" value={`${event.registrationCount ?? 0}`} />

        <Text style={styles.sectionHeader}>Description</Text>
        <Text style={styles.description}>{event.description}</Text>

        <Text style={styles.sectionHeader}>Admin Note (optional)</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Provide feedback to the organizer..."
          placeholderTextColor="#9e9e9e"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {loading ? (
          <ActivityIndicator color="#b71c1c" style={{ marginTop: 24 }} />
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => handleDecision(EVENT_STATUS.REJECTED)}
            >
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => handleDecision(EVENT_STATUS.APPROVED)}
            >
              <Text style={styles.approveText}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function StatusBadge({ status }) {
  const colors = {
    [EVENT_STATUS.PENDING]:  { bg: '#fff8e1', text: '#f57f17' },
    [EVENT_STATUS.APPROVED]: { bg: '#e8f5e9', text: '#2e7d32' },
    [EVENT_STATUS.REJECTED]: { bg: '#ffebee', text: '#c62828' },
  };
  const c = colors[status] ?? colors[EVENT_STATUS.PENDING];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { paddingBottom: 60 },
  image: { width: '100%', height: 200 },
  imagePlaceholder: { backgroundColor: '#e8eaf6', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#9e9e9e' },
  body: { padding: 20 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  statusLabel: { fontSize: 14, color: '#757575', fontWeight: '600' },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  title: { fontSize: 22, fontWeight: '800', color: '#212121', marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoLabel: { color: '#9e9e9e', fontSize: 13, fontWeight: '600' },
  infoValue: { color: '#424242', fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right' },
  sectionHeader: { fontSize: 15, fontWeight: '700', color: '#212121', marginTop: 20, marginBottom: 8 },
  description: { fontSize: 14, color: '#616161', lineHeight: 22 },
  noteInput: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    padding: 13, fontSize: 14, color: '#212121', backgroundColor: '#fff', height: 90,
  },
  actionRow: { flexDirection: 'row', gap: 14, marginTop: 28 },
  rejectBtn: {
    flex: 1, borderWidth: 2, borderColor: '#c62828', borderRadius: 12,
    padding: 15, alignItems: 'center',
  },
  rejectText: { color: '#c62828', fontSize: 16, fontWeight: '700' },
  approveBtn: {
    flex: 1, backgroundColor: '#2e7d32', borderRadius: 12,
    padding: 15, alignItems: 'center',
  },
  approveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
