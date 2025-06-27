import React, { useEffect, useContext } from 'react';
import { Slot, useRouter, SplashScreen } from 'expo-router';
import { AuthContext, AuthProvider, AuthContextType } from '../context/AuthContext';

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const auth = useContext(AuthContext) as AuthContextType;
  const router = useRouter();

  useEffect(() => {
    if (auth.isLoading) {
      return;
    }

    SplashScreen.hideAsync();

    if (auth.isAuthenticated) {
      router.replace('/(tabs)/paramedic-dashboard');
    } else {
      router.replace('/(auth)/login');
    }
  }, [auth.isLoading, auth.isAuthenticated]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
