import React, { useContext } from 'react';
import { Tabs, Redirect } from 'expo-router';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function TabsLayout() {
  const { userRole, isAuthenticated } = useContext(AuthContext) as AuthContextType;
    if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: userRole === 'paramedic' ? Colors.roles.paramedic : Colors.roles.hospital,
        headerShown: false,
      })}
    >
      <Tabs.Screen
        name="paramedic-dashboard"
        options={{
          title: 'الخريطة',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-marker-outline" size={size} color={color} />
          ),
          href: userRole === 'paramedic' ? '/paramedic-dashboard' : null,
        }}
      />
      <Tabs.Screen
        name="add-case"
        options={{
          title: 'إضافة حالة',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-box-outline" size={size} color={color} />
          ),
          href: userRole === 'paramedic' ? '/add-case' : null,
        }}
      />
      <Tabs.Screen
        name="hospital-dashboard"
        options={{
          title: 'لوحة التحكم',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="hospital-building" size={size} color={color} />
          ),
          href: userRole === 'hospital' ? '/hospital-dashboard' : null,
        }}
      />
    </Tabs>
  );
}