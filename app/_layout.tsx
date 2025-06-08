import React, { useEffect, useContext } from 'react';
import { Slot, useRouter, useSegments, SplashScreen } from 'expo-router';
import { AuthContext, AuthProvider, AuthContextType } from '../context/AuthContext';

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { isAuthenticated, userRole, isLoading } = useContext(AuthContext) as AuthContextType;
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated) {

      if (inAuthGroup) {
        if (userRole === 'paramedic') {
          router.replace('/paramedic-dashboard'); 
        } else if (userRole === 'hospital') {
          router.replace('/hospital-dashboard');
        }
      }
    } else {

      if (!inAuthGroup) {
        router.replace(userRole ? '/login' : '/select-role');
      }
    }
  }, [isAuthenticated, userRole, isLoading, segments]);


  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
