import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useColorScheme,
  StatusBar,
  Image,
} from 'react-native';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

const AppLogo = ({ size }: { size: number }) => (
  <View style={styles.logoContainer}>
    <Image
      source={require('../../assets/images/splash-icon.png')}
      style={{ width: size, height: size, resizeMode: 'contain' }}
    />
    <Text style={[FONTS.body, { color: COLORS.light.textSecondary, marginTop: SIZES.base }]}>
      نظام الاستجابة الطارئة
    </Text>
  </View>
);

export default function SelectRoleScreen() {
  const { setRole } = useContext(AuthContext) as AuthContextType;
  const uiTheme = COLORS[useColorScheme() || 'light'];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: uiTheme.background }]}>
      <StatusBar barStyle={useColorScheme() === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        <AppLogo size={120} />

        <Text style={[styles.title, { color: uiTheme.text }]}>اختر دورك للبدء</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: COLORS.roles.paramedic }]}
            onPress={() => setRole('paramedic')}
          >
            <MaterialCommunityIcons name="ambulance" size={40} color="white" />
            <Text style={styles.buttonText}>مسعف</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: COLORS.roles.hospital }]}
            onPress={() => setRole('hospital')}
          >
            <MaterialCommunityIcons name="hospital-building" size={40} color="white" />
            <Text style={styles.buttonText}>مستشفى</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding * 2,
  },
  title: {
    ...FONTS.h2,
    marginBottom: SIZES.padding * 1.5,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 400,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding / 1.2,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    ...FONTS.h2,
    color: 'white',
    marginLeft: SIZES.base * 2,
  },
});
