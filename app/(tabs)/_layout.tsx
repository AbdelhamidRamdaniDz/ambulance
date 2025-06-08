// app/(tabs)/_layout.tsx
import React, { useContext } from 'react';
import { Tabs } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';

export default function TabsLayout() {
  const { userRole } = useContext(AuthContext);

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF', headerShown: false }}>
      <Tabs.Screen
        name="(paramedic)"
        options={{
          title: 'واجهة المسعف',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="medkit" color={color} />,
          href: userRole === 'paramedic' ? '/(tabs)/(paramedic)/dashboard' : null,
        }}
      />
      <Tabs.Screen
        name="(hospital)"
        options={{
          title: 'واجهة المستشفى',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="hospital-o" color={color} />,
          href: userRole === 'hospital' ? '/(tabs)/(hospital)/dashboard' : null,
        }}
      />
    </Tabs>
  );
}