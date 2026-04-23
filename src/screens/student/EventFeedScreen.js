import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image, ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { listenApprovedEvents } from '../../services/eventService';

const CATEGORIES = ['All', 'Academic', 'Sports', 'Cultural', 'Workshop', 'Other'];

const CATEGORY_COLORS = {
  Academic: '#1B2A6B', Sports: '#1b5e20', Cultural: '#7b1fa2',
  Workshop: '#e65100', Other: '#c62828', All: '#424242',
};

export default function EventFeedScreen({ navigation }) {
  const { profile } = useAuth();
  const [events, setEvents]     = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const unsub = listenApprovedEvents((data) => {
      setEvents(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    let result = events;
    if (category !== 'All') result = result.filter((e) => e.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) => e.title?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q),
      );
    }
    setFiltered(result);
  }, [events, search, category]);

  const renderEvent = useCallback(({ item, index }) => {
    const color = CATEGORY_COLORS[item.category] ?? '#1B2A6B';
    const isFeatured = index === 0;

    return (
      <TouchableOpacity
        style={[styles.card, isFeatured && styles.featuredCard]}
        onPress={() => navigation.navigate('EventDetail', { event: item })}
        activeOpacity={0.92}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={[styles.cardImage, isFeatured && styles.featuredImage]} />
        ) : (
          <View style={[styles.cardImage, isFeatured && styles.featuredImage, { backgroundColor: color + '22' }]}>
            <Text style={{ fontSize: isFeatured ? 48 : 32 }}>🎉</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <View style={[styles.catBadge, { backgroundColor: color + '18' }]}>
            <Text style={[styles.catText, { color }]}>{item.category ?? 'General'}</Text>
          </View>
          <Text style={[styles.cardTitle, isFeatured && styles.featuredTitle]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.cardMeta}>
            <Text style={styles.metaText}>📍 {item.location}</Text>
            <Text style={styles.metaText}>📅 {item.date}</Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.regCount}>👥 {item.registrationCount ?? 0} registered</Text>
            {item.capacity && (
              <Text style={styles.capacity}>{item.capacity - (item.registrationCount ?? 0)} spots left</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [navigation]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1B2A6B" /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Greeting */}
      <View style={styles.greetingBox}>
        <Text style={styles.greeting}>Hello, {profile?.displayName?.split(' ')[0] ?? 'Student'} 👋</Text>
        <Text style={styles.greetingSub}>Discover what's happening on campus</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Categories */}
      <View style={styles.catWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {CATEGORIES.map((cat) => {
            const color = CATEGORY_COLORS[cat] ?? '#424242';
            const active = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, active && { backgroundColor: color }]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catChipText, active && { color: '#fff' }]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Events List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎪</Text>
            <Text style={styles.emptyTitle}>No Events Yet</Text>
            <Text style={styles.emptySub}>Check back soon for upcoming campus events.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  greetingBox: { backgroundColor: '#1B2A6B', padding: 20, paddingTop: 16, paddingBottom: 20 },
  greeting: { fontSize: 20, fontWeight: '800', color: '#fff' },
  greetingSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', margin: 14, marginBottom: 8,
    borderRadius: 14, paddingHorizontal: 14, elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#1a1a2e', paddingVertical: 12 },
  catWrapper: { height: 50 },
  catRow: { paddingHorizontal: 14, alignItems: 'center', gap: 8 },
  catChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e8e8e8',
    height: 36, justifyContent: 'center',
  },
  catChipText: { fontSize: 13, fontWeight: '700', color: '#666' },
  list: { padding: 14, gap: 14, paddingBottom: 30 },
  card: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8 },
  featuredCard: { elevation: 6 },
  cardImage: { width: '100%', height: 140, justifyContent: 'center', alignItems: 'center' },
  featuredImage: { height: 200 },
  cardBody: { padding: 14 },
  catBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 8 },
  catText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a2e', marginBottom: 8, lineHeight: 22 },
  featuredTitle: { fontSize: 18 },
  cardMeta: { gap: 4, marginBottom: 10 },
  metaText: { fontSize: 13, color: '#666' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  regCount: { fontSize: 12, color: '#1B2A6B', fontWeight: '700' },
  capacity: { fontSize: 12, color: '#C0392B', fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#888', textAlign: 'center', paddingHorizontal: 20 },
});
