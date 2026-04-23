import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, Image, Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const TU_BLUE = '#1B2A6B';
const TU_RED  = '#C0392B';

const SLIDES = [
  {
    id: '1',
    emoji: '🎓',
    title: 'Welcome to UniEvents',
    subtitle: 'Your official event management platform for Trinity University — Building on the Rock.',
    bg: TU_BLUE,
    showLogo: true,
  },
  {
    id: '2',
    emoji: '🗓️',
    title: 'Discover Campus Events',
    subtitle: 'Browse approved events from all faculties. Filter by category, search by name, and never miss what matters.',
    bg: '#16213e',
    showLogo: false,
  },
  {
    id: '3',
    emoji: '✅',
    title: 'Register in One Tap',
    subtitle: 'Register for events instantly and manage all your bookings from one place. Get notified of updates in real time.',
    bg: '#1b3a2e',
    showLogo: false,
  },
  {
    id: '4',
    emoji: '🛡️',
    title: 'Role-Based Access',
    subtitle: 'Students browse and register. Organizers create events. Admins approve proposals. Everyone has their place.',
    bg: '#3b1a1a',
    showLogo: false,
  },
];

export default function OnboardingScreen({ onDone }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  async function handleDone() {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    onDone();
  }

  function handleNext() {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleDone();
    }
  }

  function handleSkip() {
    handleDone();
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { backgroundColor: item.bg }]}>
            {item.showLogo ? (
              <Image
                source={require('../../../assets/logo-rounded.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.emojiCircle}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
            )}
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.btnRow}>
          {currentIndex < SLIDES.length - 1 ? (
            <>
              <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                <Text style={styles.nextText}>Next →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.getStartedBtn} onPress={handleDone}>
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TU_BLUE },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 36,
    paddingTop: 80,
  },
  logo: { width: 220, height: 140, marginBottom: 40 },
  emojiCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 40, borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  emoji: { fontSize: 52 },
  title: {
    fontSize: 28, fontWeight: '900', color: '#fff',
    textAlign: 'center', marginBottom: 20, lineHeight: 34,
  },
  subtitle: {
    fontSize: 16, color: 'rgba(255,255,255,0.75)',
    textAlign: 'center', lineHeight: 26,
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingBottom: 48, paddingHorizontal: 28,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingTop: 20,
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 8 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: { backgroundColor: '#fff', width: 24 },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skipBtn: { padding: 14 },
  skipText: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '600' },
  nextBtn: {
    backgroundColor: '#fff', borderRadius: 30,
    paddingHorizontal: 32, paddingVertical: 14,
  },
  nextText: { color: TU_BLUE, fontWeight: '800', fontSize: 15 },
  getStartedBtn: {
    backgroundColor: TU_RED, borderRadius: 30, flex: 1,
    paddingVertical: 16, alignItems: 'center', elevation: 4,
  },
  getStartedText: { color: '#fff', fontWeight: '900', fontSize: 17 },
});
