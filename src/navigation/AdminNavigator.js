import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import PendingEventsScreen from '../screens/admin/PendingEventsScreen';
import EventReviewScreen from '../screens/admin/EventReviewScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function PendingStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PendingEvents"
        component={PendingEventsScreen}
        options={{ title: 'Pending Proposals' }}
      />
      <Stack.Screen
        name="EventReview"
        component={EventReviewScreen}
        options={{ title: 'Review Event' }}
      />
    </Stack.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#b71c1c',
        tabBarInactiveTintColor: '#9e9e9e',
        headerShown: false,
        tabBarStyle: { paddingBottom: 6, height: 60 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{ title: 'Dashboard', headerShown: true, tabBarIcon: () => <Text style={{ fontSize: 20 }}>📊</Text> }}
      />
      <Tab.Screen
        name="Proposals"
        component={PendingStack}
        options={{ title: 'Proposals', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📝</Text> }}
      />
    </Tab.Navigator>
  );
}
