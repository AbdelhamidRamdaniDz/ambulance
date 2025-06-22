// (auth)/login.tsx
import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar,
  SafeAreaView, Image, ScrollView, useColorScheme
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { Alert } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const auth = useContext(AuthContext);
  const colorMode = useColorScheme() || 'light';
  const uiTheme = COLORS[colorMode];

  const handleLogin = async () => {
    if (!auth) return;

    if (!email || !password) {
      Alert.alert('حقول فارغة', 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setIsLoading(true);
    try {
      await auth.login(email, password);
    } catch (error: unknown) {
  if (error instanceof Error) {
    Alert.alert('فشل تسجيل الدخول', error.message || 'حدث خطأ ما.');
  } else {
    Alert.alert('فشل تسجيل الدخول', 'حدث خطأ غير متوقع.');
  }
} finally {
      setIsLoading(false);
    }
  };

  if (!auth) {
    return <View style={styles.loadingView}><ActivityIndicator size="large" /></View>;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: uiTheme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <StatusBar barStyle={colorMode === 'dark' ? 'light-content' : 'dark-content'} />
        <ScrollView contentContainerStyle={styles.container}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={{ width: 100, height: 100, resizeMode: 'contain', marginBottom: 20 }}
          />

          <Text style={[styles.headerTitle, { color: uiTheme.text }]}>تسجيل دخول - مسعف</Text>

          <View style={styles.formContainer}>
            <View style={[styles.inputContainer, { backgroundColor: uiTheme.card }]}>
              <MaterialCommunityIcons name="email-outline" size={24} color={uiTheme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: uiTheme.text }]}
                placeholder="البريد الإلكتروني"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={uiTheme.textSecondary}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: uiTheme.card }]}>
              <MaterialCommunityIcons name="lock-outline" size={24} color={uiTheme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: uiTheme.text }]}
                placeholder="كلمة المرور"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={uiTheme.textSecondary}
              />
            </View>

            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: COLORS.roles.paramedic },
                pressed && styles.buttonPressed,
                isLoading && styles.buttonLoading,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>تسجيل الدخول</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  loadingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.h2,
    marginBottom: SIZES.padding * 1.5,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding / 1.5,
    paddingHorizontal: SIZES.padding / 1.5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputIcon: {
    marginRight: SIZES.base,
  },
  input: {
    ...FONTS.body,
    flex: 1,
    height: 55,
    textAlign: 'right',
  },
  button: {
    height: 55,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.base,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonLoading: {
    opacity: 0.8,
  },
  buttonText: {
    ...FONTS.h3,
    color: '#ffffff',
  },
});
