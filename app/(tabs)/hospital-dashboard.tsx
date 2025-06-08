import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  useColorScheme,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AmbulanceAlert = {
  id: string;
  patientName: string;
  age: number;
  condition: string;
  eta: number;
};

export default function HospitalDashboard() {
  const { logout } = useContext(AuthContext);
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme || 'light'];

  const [bedsAvailable, setBedsAvailable] = useState(10);
  const [erReady, setErReady] = useState(true);
  const [alerts, setAlerts] = useState<AmbulanceAlert[]>([]);

  const changeBedCount = (amount: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBedsAvailable((prev) => Math.max(0, prev + amount));
  };

  const simulateNewAlert = () => {
    const newAlert: AmbulanceAlert = {
      id: Math.random().toString(),
      patientName: 'مريض',
      age: Math.floor(Math.random() * 60) + 20,
      condition: 'إصابة حادث',
      eta: Math.floor(Math.random() * 15) + 5,
    };
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setAlerts((prev) => [newAlert, ...prev]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'لوحة تحكم المستشفى',
          headerStyle: { backgroundColor: theme.card },
          headerTitleStyle: { color: theme.text, ...FONTS.title },
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={{ paddingHorizontal: SIZES.padding / 1.5 }}>
              <Text style={{ color: COLORS.status.unavailable, ...FONTS.h3, fontWeight: 'bold' }}>خروج</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: erReady ? COLORS.roles.hospital : COLORS.status.unavailable }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="hospital-building" size={24} color={COLORS.roles.hospital} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>الحالة العامة</Text>
          </View>
          <Text style={[styles.statusText, { color: erReady ? COLORS.roles.hospital : COLORS.status.unavailable }]}>
            {erReady ? 'قسم الطوارئ جاهز' : 'قسم الطوارئ غير متاح'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.controlRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>تفعيل جاهزية الطوارئ</Text>
            <Switch
              value={erReady}
              onValueChange={setErReady}
              trackColor={{ false: '#767577', true: COLORS.roles.hospital }}
              thumbColor={Platform.OS === 'ios' ? theme.card : COLORS.roles.hospital}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="bed-queen-outline" size={24} color={theme.textSecondary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>الأسرة المتاحة</Text>
          </View>
          <View style={styles.bedControlContainer}>
            <TouchableOpacity style={[styles.bedControlButton, { backgroundColor: COLORS.roles.paramedic }]} onPress={() => changeBedCount(1)}>
              <MaterialCommunityIcons name="plus" size={24} color="white" />
            </TouchableOpacity>
            <Text style={[styles.bedCount, { color: theme.text }]}>{bedsAvailable}</Text>
            <TouchableOpacity style={[styles.bedControlButton, { backgroundColor: COLORS.status.unavailable }]} onPress={() => changeBedCount(-1)}>
              <MaterialCommunityIcons name="minus" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="bell-ring-outline" size={24} color={COLORS.roles.paramedic} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>الإشعارات القادمة</Text>
            {alerts.length > 0 && (
              <View style={styles.alertCountBadge}>
                <Text style={styles.alertCountText}>{alerts.length}</Text>
              </View>
            )}
          </View>
          {alerts.length === 0 ? (
            <Text style={[styles.noAlertsText, { color: theme.textSecondary }]}>لا توجد حالات قادمة حالياً.</Text>
          ) : (
            alerts.map((alert) => (
              <View key={alert.id} style={[styles.notificationItem, { borderBottomColor: theme.border }]}>
                <View style={styles.notificationRow}>
                  <Text style={[styles.notificationLabel, { color: theme.text }]}>
                    {alert.patientName}, {alert.age} سنة
                  </Text>
                  <Text style={[styles.notificationValue, { color: theme.textSecondary }]}>
                    ETA: {alert.eta} min
                  </Text>
                </View>
                <Text style={[styles.notificationCondition, { color: COLORS.roles.hospital }]}>
                  {alert.condition}
                </Text>
              </View>
            ))
          )}
          <TouchableOpacity style={[styles.simulateButton, { backgroundColor: theme.background }]} onPress={simulateNewAlert}>
            <Text style={[styles.simulateButtonText, { color: theme.textSecondary }]}>محاكاة وصول إشعار</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollView: { padding: SIZES.padding / 1.5 },
  card: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding / 1.2,
    marginBottom: SIZES.padding / 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base * 1.5,
  },
  cardTitle: {
    ...FONTS.title,
    marginHorizontal: SIZES.base,
  },
  statusText: {
    ...FONTS.h2,
    textAlign: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...FONTS.body,
  },
  bedControlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: SIZES.base,
  },
  bedControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  bedCount: {
    ...FONTS.h1,
    fontSize: 48,
    textAlign: 'center',
    minWidth: 80,
  },
  alertCountBadge: {
    marginLeft: 'auto',
    backgroundColor: COLORS.status.unavailable,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertCountText: {
    color: 'white',
    ...FONTS.body,
    fontSize: 12,
    fontWeight: 'bold',
  },
  noAlertsText: {
    ...FONTS.body,
    textAlign: 'center',
    paddingVertical: SIZES.padding,
  },
  notificationItem: {
    paddingVertical: SIZES.base * 1.5,
    borderBottomWidth: 1,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationLabel: {
    ...FONTS.h3,
  },
  notificationValue: {
    ...FONTS.body,
  },
  notificationCondition: {
    ...FONTS.body,
    marginTop: SIZES.base / 2,
  },
  simulateButton: {
    marginTop: SIZES.padding,
    paddingVertical: SIZES.base * 1.5,
    borderRadius: SIZES.radius,
  },
  simulateButtonText: {
    textAlign: 'center',
    ...FONTS.body,
    fontWeight: 'bold',
  },
});