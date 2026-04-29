import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { updateEvent } from "../../services/eventService";

const CATEGORIES = ["Academic", "Sports", "Cultural", "Workshop", "Other"];

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatTime(date) {
  let h = date.getHours();
  const min = String(date.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${min} ${ampm}`;
}

function parseDateString(str) {
  if (!str) return new Date();
  const [y, m, d] = str.split("-").map(Number);
  return isNaN(y) ? new Date() : new Date(y, m - 1, d);
}

export default function EditEventScreen({ route, navigation }) {
  const { event } = route.params;
  const [form, setForm] = useState({
    title: event.title ?? "",
    description: event.description ?? "",
    date: event.date ?? "",
    time: event.time ?? "",
    location: event.location ?? "",
    capacity: event.capacity ? String(event.capacity) : "",
    category: event.category ?? "Academic",
  });
  const [selectedDate, setSelectedDate] = useState(parseDateString(event.date));
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onDateChange(event, date) {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      updateField("date", formatDate(date));
    }
  }

  function onTimeChange(event, date) {
    if (Platform.OS === "android") setShowTimePicker(false);
    if (date) {
      setSelectedTime(date);
      updateField("time", formatTime(date));
    }
  }

  function showAndroidDatePicker() {
    DateTimePickerAndroid.open({
      value: selectedDate,
      onChange: onDateChange,
      mode: "date",
    });
  }

  function showAndroidTimePicker() {
    DateTimePickerAndroid.open({
      value: selectedTime,
      onChange: onTimeChange,
      mode: "time",
    });
  }

  async function handleUpdate() {
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.date ||
      !form.location.trim()
    ) {
      Alert.alert(
        "Missing fields",
        "Title, Description, Date, and Location are required.",
      );
      return;
    }
    setLoading(true);
    try {
      await updateEvent(event.id, {
        ...form,
        capacity: form.capacity ? parseInt(form.capacity, 10) : null,
      });
      Alert.alert("Updated!", "Event re-submitted for review.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={(v) => updateField("title", v)}
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={(v) => updateField("description", v)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Date *</Text>
        <TouchableOpacity
          style={styles.pickerBtn}
          onPress={() => {
            if (Platform.OS === "android") {
              showAndroidDatePicker();
            } else {
              setShowDatePicker(true);
            }
          }}
        >
          <Text style={styles.pickerIcon}>📅</Text>
          <Text style={[styles.pickerText, !form.date && { color: "#9e9e9e" }]}>
            {form.date || "Select date"}
          </Text>
        </TouchableOpacity>
        {Platform.OS === "ios" && showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={onDateChange}
          />
        )}

        <Text style={styles.label}>Time</Text>
        <TouchableOpacity
          style={styles.pickerBtn}
          onPress={() => {
            if (Platform.OS === "android") {
              showAndroidTimePicker();
            } else {
              setShowTimePicker(true);
            }
          }}
        >
          <Text style={styles.pickerIcon}>🕐</Text>
          <Text style={[styles.pickerText, !form.time && { color: "#9e9e9e" }]}>
            {form.time || "Select time"}
          </Text>
        </TouchableOpacity>
        {Platform.OS === "ios" && showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="spinner"
            onChange={onTimeChange}
          />
        )}

        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          value={form.location}
          onChangeText={(v) => updateField("location", v)}
        />

        <Text style={styles.label}>Capacity</Text>
        <TextInput
          style={styles.input}
          value={form.capacity}
          onChangeText={(v) => updateField("capacity", v)}
          keyboardType="numeric"
          placeholder="Unlimited"
          placeholderTextColor="#9e9e9e"
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, form.category === cat && styles.chipActive]}
              onPress={() => updateField("category", cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  form.category === cat && styles.chipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Save & Re-submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  form: { padding: 20, paddingBottom: 60 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 13,
    fontSize: 15,
    color: "#212121",
    backgroundColor: "#fff",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  pickerBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
  },
  pickerIcon: { fontSize: 18, marginRight: 10 },
  pickerText: { fontSize: 15, color: "#212121" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  chipActive: { borderColor: "#1b5e20", backgroundColor: "#e8f5e9" },
  chipText: { color: "#757575", fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#1b5e20" },
  imagePicker: {
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    borderRadius: 12,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
    marginTop: 6,
    overflow: "hidden",
  },
  imagePickerInner: { alignItems: "center" },
  imagePickerIcon: { fontSize: 32, marginBottom: 8 },
  imagePickerText: { color: "#9e9e9e", fontSize: 15 },
  imagePreview: { width: "100%", height: "100%" },
  btn: {
    backgroundColor: "#1b5e20",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 28,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
