import React, { useState, useContext, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Image,
} from 'react-native';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

const AppLogo = ({ size }: { size: number }) => (
  <View style={styles.logoContainer}>
    <Image
      source={require('../../assets/images/Ambo.png')}
      style={{ width: size, height: size, resizeMode: 'contain' }}
    />
  </View>
);


export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, userRole } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();

  const theme = useMemo(() => ({
    primaryColor: userRole === 'hospital' ? COLORS.roles.hospital : COLORS.roles.paramedic,
    icon: userRole === 'hospital' ? '🏥' : '🚑',
  }), [userRole]);
  
  const colorMode = useColorScheme() || 'light';
  const uiTheme = COLORS[colorMode];

  const handleLogin = async () => {
    if (username.trim() === '' || password.trim() === '') {
      Alert.alert('خطأ', 'الرجاء إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    if (!userRole) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    login(userRole);
  };

  if (!userRole) {
    return <View style={styles.loadingView}><ActivityIndicator size="large" /></View>;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: uiTheme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <StatusBar barStyle={colorMode === 'dark' ? 'light-content' : 'dark-content'} />
        <ScrollView contentContainerStyle={styles.container}>
          
          <AppLogo size={120} />
          
          <Text style={[styles.headerTitle, { color: uiTheme.text }]}>
            تسجيل دخول - {userRole === 'paramedic' ? 'مسعف' : 'مستشفى'} {theme.icon}
          </Text>
          
          <View style={styles.formContainer}>
            <View style={[styles.inputContainer, { backgroundColor: uiTheme.card }]}>
              <MaterialCommunityIcons name="account-outline" size={24} color={uiTheme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: uiTheme.text }]}
                placeholder="اسم المستخدم"
                value={username}
                onChangeText={setUsername}
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
              style={({ pressed }: { pressed: boolean }) => [
                styles.button,
                { backgroundColor: theme.primaryColor },
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
          
          <TouchableOpacity onPress={() => router.replace('/select-role')} style={styles.backButton}>
             <MaterialCommunityIcons name="arrow-left-circle-outline" size={20} color={uiTheme.textSecondary} />
             <Text style={[styles.backButtonText, { color: uiTheme.textSecondary }]}>تغيير الدور</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding,
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
  backButton: {
    marginTop: SIZES.padding * 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    ...FONTS.body,
    marginLeft: SIZES.base,
    textDecorationLine: 'underline',
  },
});
