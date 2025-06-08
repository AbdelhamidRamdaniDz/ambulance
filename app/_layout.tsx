// app/_layout.tsx
import React, { useEffect, useContext } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthContext, AuthProvider } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';

function InitialLayout() {
  const { isAuthenticated, userRole, isLoading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated) {
      if (inAuthGroup) {
        if (userRole === 'paramedic') {
          router.replace('/(tabs)/(paramedic)/dashboard');
        } else if (userRole === 'hospital') {
          router.replace('/(tabs)/(hospital)/dashboard');
        }
      }
    } else {
      if (!inAuthGroup) {
        router.replace(userRole ? '/login' : '/select-role');
      }
    }
  }, [isAuthenticated, userRole, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}