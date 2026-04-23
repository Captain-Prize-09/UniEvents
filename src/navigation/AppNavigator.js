import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../config/firebase';
import AuthNavigator from './AuthNavigator';
import StudentNavigator from './StudentNavigator';
import OrganizerNavigator from './OrganizerNavigator';
import AdminNavigator from './AdminNavigator';

export default function AppNavigator() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1B2A6B" />
      </View>
    );
  }

  const renderNavigator = () => {
    if (!user) return <AuthNavigator />;
    switch (role) {
      case ROLES.ADMIN:     return <AdminNavigator />;
      case ROLES.ORGANIZER: return <OrganizerNavigator />;
      default:              return <StudentNavigator />;
    }
  };

  return <NavigationContainer>{renderNavigator()}</NavigationContainer>;
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});
