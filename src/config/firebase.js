import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAZLbBiheN17kRMkpiXkRNyV-_yE6JnUIA",
  authDomain: "trinityems.firebaseapp.com",
  projectId: "trinityems",
  storageBucket: "trinityems.firebasestorage.app",
  messagingSenderId: "84837301158",
  appId: "1:84837301158:web:0e25ad36fce501c547ad67"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  REGISTRATIONS: 'registrations',
  FEEDBACK: 'feedback',
  NOTIFICATIONS: 'notifications',
};

export const ROLES = {
  STUDENT: 'student',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
};

export const EVENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};
