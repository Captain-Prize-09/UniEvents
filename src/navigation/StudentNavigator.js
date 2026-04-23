import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import EventFeedScreen from '../screens/student/EventFeedScreen';
import EventDetailScreen from '../screens/student/EventDetailScreen';
import FeedbackScreen from '../screens/student/FeedbackScreen';
import MyRegistrationsScreen from '../screens/student/MyRegistrationsScreen';
import NotificationsScreen from '../screens/student/NotificationsScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import EditProfileScreen from '../screens/student/EditProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1B2A6B' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '800' } }}>
      <Stack.Screen name="EventFeed" component={EventFeedScreen} options={{ title: 'Discover Events' }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event Details' }} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ title: 'Leave Feedback' }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1B2A6B' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '800' } }}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    </Stack.Navigator>
  );
}

export default function StudentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1B2A6B',
        tabBarInactiveTintColor: '#9e9e9e',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 8, paddingTop: 6, height: 65,
          backgroundColor: '#fff', elevation: 12,
          borderTopWidth: 0, shadowOpacity: 0.1,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
      }}
    >
      <Tab.Screen
        name="Browse"
        component={EventsStack}
        options={{ title: 'Events', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>🏠</Text> }}
      />
      <Tab.Screen
        name="MyEvents"
        component={MyRegistrationsScreen}
        options={{ title: 'My Events', headerShown: true,
          headerStyle: { backgroundColor: '#1B2A6B' }, headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '800' },
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>🎟️</Text> }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Alerts', headerShown: true,
          headerStyle: { backgroundColor: '#1B2A6B' }, headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '800' },
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>🔔</Text> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}
