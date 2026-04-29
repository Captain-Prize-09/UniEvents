import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCpnQ0u_9QLjq_8jht_ztvPw2U8xJxYPwo",
  authDomain: "trinityems-1c506.firebaseapp.com",
  databaseURL: "https://trinityems-1c506-default-rtdb.firebaseio.com",
  projectId: "trinityems-1c506",
  storageBucket: "trinityems-1c506.firebasestorage.app",
  messagingSenderId: "343362036747",
  appId: "1:343362036747:web:ddd745b1dfd981961a930e",
  measurementId: "G-1F30LVG4M8"
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
