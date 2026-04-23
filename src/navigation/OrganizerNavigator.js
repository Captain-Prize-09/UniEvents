import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import OrganizerDashboardScreen from '../screens/organizer/OrganizerDashboardScreen';
import CreateEventScreen from '../screens/organizer/CreateEventScreen';
import EditEventScreen from '../screens/organizer/EditEventScreen';
import EventRegistrationsScreen from '../screens/organizer/EventRegistrationsScreen';
import EventFeedbackScreen from '../screens/organizer/EventFeedbackScreen';
import OrganizerProfileScreen from '../screens/organizer/OrganizerProfileScreen';
import EditOrganizerProfileScreen from '../screens/organizer/EditOrganizerProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const headerStyle = { backgroundColor: '#1b5e20' };
const headerOptions = { headerStyle, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '800' } };

function EventsStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="OrganizerDashboard" component={OrganizerDashboardScreen} options={{ title: 'My Events' }} />
      <Stack.Screen name="EditEvent" component={EditEventScreen} options={{ title: 'Edit Event' }} />
      <Stack.Screen name="EventRegistrations" component={EventRegistrationsScreen} options={{ title: 'Registrations' }} />
      <Stack.Screen name="EventFeedback" component={EventFeedbackScreen} options={{ title: 'Student Feedback' }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="OrganizerProfile" component={OrganizerProfileScreen} options={{ title: 'My Profile' }} />
      <Stack.Screen name="EditOrganizerProfile" component={EditOrganizerProfileScreen} options={{ title: 'Edit Profile' }} />
    </Stack.Navigator>
  );
}

export default function OrganizerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1b5e20',
        tabBarInactiveTintColor: '#9e9e9e',
        headerShown: false,
        tabBarStyle: { paddingBottom: 8, paddingTop: 6, height: 65, backgroundColor: '#fff', elevation: 12, borderTopWidth: 0 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
      }}
    >
      <Tab.Screen
        name="MyEvents"
        component={EventsStack}
        options={{ title: 'My Events', tabBarIcon: () => <Text style={{ fontSize: 22 }}>📋</Text> }}
      />
      <Tab.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{
          title: 'Create', headerShown: true, ...headerOptions,
          headerTitle: 'Create Event',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>➕</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ title: 'Profile', tabBarIcon: () => <Text style={{ fontSize: 22 }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}
