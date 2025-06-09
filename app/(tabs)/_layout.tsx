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
      screenOptions={{
        tabBarActiveTintColor: userRole === 'paramedic' ? Colors.roles.paramedic : Colors.roles.hospital,
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
            <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
          ),
          href: userRole === 'hospital' ? '/hospital-dashboard' : null,
        }}
      />
      <Tabs.Screen
        name="patients-log"
        options={{
          title: 'سجل المرضى',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document-outline" size={size} color={color} />
          ),
          href: userRole === 'hospital' ? '/patients-log' : null,
        }}
      />
      <Tabs.Screen
        name="hospital-schedule"
        options={{
          title: 'المناوبات',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-clock" size={size} color={color} />
          ),
          href: userRole === 'hospital' ? '/hospital-schedule' : null,
        }}
      />
      <Tabs.Screen
        name="nearby-ambulances"
        options={{
          title: 'الإسعافات القريبة',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="ambulance" size={size} color={color} />
          ),
          href: userRole === 'hospital' ? '/nearby-ambulances' : null,
        }}
      />
    </Tabs>
  );
}
