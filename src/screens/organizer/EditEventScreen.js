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
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { updateEvent, resolveImageUrl } from "../../services/eventService";

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

function parseTimeString(timeStr) {
  if (!timeStr) return new Date();
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/);
  if (!match) return new Date();

  let [_, hours, minutes, ampm] = match;
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);

  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;

  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
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
    imageUrl: event.imageUrl ?? "",
    category: event.category ?? "Academic",
  });
  const [selectedDate, setSelectedDate] = useState(parseDateString(event.date));
  const [selectedTime, setSelectedTime] = useState(parseTimeString(event.time));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  function updateField(key, value) {
    if (key === "imageUrl") setImageError(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onDateChange(event, date) {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (event.type === "set" && date) {
        setSelectedDate(date);
        updateField("date", formatDate(date));
      }
    } else {
      if (date) {
        setSelectedDate(date);
        updateField("date", formatDate(date));
      }
    }
  }

  function onTimeChange(event, date) {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
      if (event.type === "set" && date) {
        setSelectedTime(date);
        updateField("time", formatTime(date));
      }
    } else {
      if (date) {
        setSelectedTime(date);
        updateField("time", formatTime(date));
      }
    }
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
            setShowDatePicker(true);
            setShowTimePicker(false);
          }}
        >
          <Text style={styles.pickerIcon}>📅</Text>
          <Text style={[styles.pickerText, !form.date && { color: "#9e9e9e" }]}>
            {form.date || "Select date"}
          </Text>
        </TouchableOpacity>

        {showDatePicker &&
          (Platform.OS === "ios" ? (
            <View style={styles.iosPickerContainer}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={onDateChange}
              />
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              onChange={onDateChange}
            />
          ))}

        <Text style={styles.label}>Time</Text>
        <TouchableOpacity
          style={styles.pickerBtn}
          onPress={() => {
            setShowTimePicker(true);
            setShowDatePicker(false);
          }}
        >
          <Text style={styles.pickerIcon}>🕐</Text>
          <Text style={[styles.pickerText, !form.time && { color: "#9e9e9e" }]}>
            {form.time || "Select time"}
          </Text>
        </TouchableOpacity>

        {showTimePicker &&
          (Platform.OS === "ios" ? (
            <View style={styles.iosPickerContainer}>
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="spinner"
                onChange={onTimeChange}
              />
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              onChange={onTimeChange}
            />
          ))}

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

        <Text style={styles.label}>Image URL</Text>
        <TextInput
          style={styles.input}
          value={form.imageUrl}
          onChangeText={(v) => updateField("imageUrl", v)}
          placeholder="https://example.com/image.jpg"
          placeholderTextColor="#9e9e9e"
          keyboardType="url"
          autoCapitalize="none"
        />

        {form.imageUrl ? (
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Preview:</Text>
            <Image
              source={{ uri: resolveImageUrl(form.imageUrl) }}
              style={styles.previewImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
            {imageError && (
              <Text style={styles.errorText}>
                Could not load image. Please check the URL.
              </Text>
            )}
          </View>
        ) : null}

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
  previewContainer: {
    marginTop: 12,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
    padding: 10,
  },
  previewLabel: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 8,
    fontWeight: "600",
  },
  previewImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  errorText: {
    color: "#c62828",
    fontSize: 12,
    marginTop: 8,
    fontWeight: "600",
  },
  iosPickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 8,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  doneBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  doneBtnText: {
    color: "#1b5e20",
    fontWeight: "700",
    fontSize: 16,
  },
});
