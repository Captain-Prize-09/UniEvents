import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(null); // null = loading

  useEffect(() => {
    AsyncStorage.getItem('hasSeenOnboarding').then((val) => {
      setShowOnboarding(val !== 'true');
    });
  }, []);

  // Still checking AsyncStorage
  if (showOnboarding === null) return null;

  if (showOnboarding) {
    return (
      <>
        <StatusBar style="light" />
        <OnboardingScreen onDone={() => setShowOnboarding(false)} />
      </>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#1B2A6B" />
      <AppNavigator />
    </AuthProvider>
  );
}
