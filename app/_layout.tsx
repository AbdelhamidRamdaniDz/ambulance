import React, { useEffect, useContext } from 'react';
import { Slot, useRouter, SplashScreen } from 'expo-router';
import { AuthContext, AuthProvider, AuthContextType } from '../context/AuthContext';

// منع شاشة البداية من الاختفاء التلقائي
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const auth = useContext(AuthContext) as AuthContextType;
  const router = useRouter();

  useEffect(() => {
    // لا تفعل شيئًا حتى يتم تحميل حالة المصادقة
    if (auth.isLoading) {
      return;
    }

    // الآن بعد أن انتهى التحميل، قم بإخفاء شاشة البداية
    SplashScreen.hideAsync();

    // اتخاذ قرار التوجيه بناءً على حالة تسجيل الدخول فقط
    if (auth.isAuthenticated) {
      // إذا كان المستخدم مسجلاً دخوله، اذهب مباشرة إلى لوحة التحكم
      router.replace('/(tabs)/paramedic-dashboard');
    } else {
      // إذا لم يكن مسجلاً دخوله، اذهب إلى صفحة تسجيل الدخول
      router.replace('/(auth)/login');
    }
  }, [auth.isLoading, auth.isAuthenticated]);

  // عرض الشاشة الحالية التي تم التوجيه إليها
  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
