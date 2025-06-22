// app/(tabs)/_layout.tsx
import React, { useContext } from 'react';
import { Tabs, Redirect } from 'expo-router';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function TabsLayout() {
  const { isAuthenticated } = useContext(AuthContext) as AuthContextType;

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.roles.paramedic,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="paramedic-dashboard"
        options={{
          title: 'الخريطة',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-marker-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-case"
        options={{
          title: 'إضافة حالة',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-box-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
