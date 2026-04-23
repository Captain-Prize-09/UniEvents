import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../contexts/AuthContext';
import { createEvent } from '../../services/eventService';

const CATEGORIES = ['Academic', 'Sports', 'Cultural', 'Workshop', 'Other'];

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime(date) {
  let h = date.getHours();
  const min = String(date.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${min} ${ampm}`;
}

export default function CreateEventScreen() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '',
    location: '', capacity: '', category: 'Academic',
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    const { title, description, date, location } = form;
    if (!title.trim() || !description.trim() || !date || !location.trim()) {
      Alert.alert('Missing fields', 'Please fill in Title, Description, Date, and Location.');
      return;
    }
    setLoading(true);
    try {
      await createEvent(user.uid, {
        ...form,
        capacity: form.capacity ? parseInt(form.capacity, 10) : null,
      });
      Alert.alert('Submitted!', 'Your event has been submitted for admin review.', [
        { text: 'OK', onPress: () => {
          setForm({ title: '', description: '', date: '', time: '', location: '', capacity: '', category: 'Academic' });
          setSelectedDate(new Date());
          setSelectedTime(new Date());
        }},
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Event Details</Text>

        <Text style={styles.label}>Title *</Text>
        <TextInput style={styles.input} value={form.title} onChangeText={(v) => updateField('title', v)} placeholder="Event title" placeholderTextColor="#9e9e9e" />

        <Text style={styles.label}>Description *</Text>
        <TextInput style={[styles.input, styles.textArea]} value={form.description} onChangeText={(v) => updateField('description', v)} placeholder="Describe the event..." placeholderTextColor="#9e9e9e" multiline numberOfLines={4} textAlignVertical="top" />

        <Text style={styles.label}>Date *</Text>
        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.pickerIcon}>📅</Text>
          <Text style={[styles.pickerText, !form.date && { color: '#9e9e9e' }]}>{form.date || 'Select date'}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate} mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={(e, date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (date) { setSelectedDate(date); updateField('date', formatDate(date)); }
            }}
          />
        )}

        <Text style={styles.label}>Time</Text>
        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.pickerIcon}>🕐</Text>
          <Text style={[styles.pickerText, !form.time && { color: '#9e9e9e' }]}>{form.time || 'Select time'}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={selectedTime} mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e, date) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (date) { setSelectedTime(date); updateField('time', formatTime(date)); }
            }}
          />
        )}

        <Text style={styles.label}>Location *</Text>
        <TextInput style={styles.input} value={form.location} onChangeText={(v) => updateField('location', v)} placeholder="Venue or room" placeholderTextColor="#9e9e9e" />

        <Text style={styles.label}>Capacity (leave blank for unlimited)</Text>
        <TextInput style={styles.input} value={form.capacity} onChangeText={(v) => updateField('capacity', v)} placeholder="Max attendees" placeholderTextColor="#9e9e9e" keyboardType="numeric" />

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat} style={[styles.chip, form.category === cat && styles.chipActive]} onPress={() => updateField('category', cat)}>
              <Text style={[styles.chipText, form.category === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit for Review</Text>}
        </TouchableOpacity>

        <View style={styles.note}>
          <Text style={styles.noteText}>Your event will be visible to students only after an administrator approves it.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  form: { padding: 20, paddingBottom: 60 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#212121', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#424242', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 13, fontSize: 15, color: '#212121', backgroundColor: '#fff' },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 13, flexDirection: 'row', alignItems: 'center' },
  pickerIcon: { fontSize: 18, marginRight: 10 },
  pickerText: { fontSize: 15, color: '#212121' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e0e0e0', backgroundColor: '#fff' },
  chipActive: { borderColor: '#1b5e20', backgroundColor: '#e8f5e9' },
  chipText: { color: '#757575', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#1b5e20' },
  btn: { backgroundColor: '#1b5e20', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 28 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  note: { backgroundColor: '#fff8e1', borderRadius: 10, padding: 14, marginTop: 16 },
  noteText: { color: '#f57f17', fontSize: 13 },
});
