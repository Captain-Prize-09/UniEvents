import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { submitFeedback } from '../../services/eventService';

const STARS = [1, 2, 3, 4, 5];

export default function FeedbackScreen({ route, navigation }) {
  const { event } = route.params;
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      Alert.alert('Rate the event', 'Please select a star rating.');
      return;
    }
    setLoading(true);
    try {
      await submitFeedback(user.uid, event.id, rating, comment.trim());
      Alert.alert('Thank you!', 'Your feedback has been submitted.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eventTitle}>{event.title}</Text>
      <Text style={styles.label}>How would you rate this event?</Text>

      <View style={styles.starsRow}>
        {STARS.map((s) => (
          <TouchableOpacity key={s} onPress={() => setRating(s)} style={styles.star}>
            <Text style={[styles.starText, rating >= s && styles.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Comments (optional)</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Share your experience..."
        placeholderTextColor="#9e9e9e"
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Submit Feedback</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  eventTitle: { fontSize: 18, fontWeight: '800', color: '#212121', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#424242', marginBottom: 10 },
  starsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  star: { padding: 4 },
  starText: { fontSize: 36, color: '#e0e0e0' },
  starActive: { color: '#fbc02d' },
  textArea: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    padding: 14, fontSize: 15, color: '#212121', height: 120,
    marginBottom: 24, backgroundColor: '#fafafa',
  },
  btn: { backgroundColor: '#1a237e', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
