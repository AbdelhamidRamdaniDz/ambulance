// app/(tabs)/hospital/dashboard.tsx
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
  UIManager
} from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// تفعيل LayoutAnimation على أندرويد
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// تعريف الألوان لتسهيل إدارتها ودعم الوضع الليلي
const COLORS = {
  light: {
    background: '#f0f2f5',
    card: '#ffffff',
    text: '#1c1c1e',
    textSecondary: '#6e6e72',
    primary: '#28a745', // أخضر للمستشفى
    accent: '#007AFF',
    border: '#e0e0e0',
  },
  dark: {
    background: '#000000',
    card: '#1c1c1e',
    text: '#ffffff',
    textSecondary: '#a0a0a5',
    primary: '#30d158', // أخضر فاتح للوضع الليلي
    accent: '#0A84FF',
    border: '#3a3a3c',
  },
  danger: '#ff3b30',
};

// تعريف نوع لبيانات الإشعار القادم
type AmbulanceAlert = {
  id: string;
  patientName: string;
  age: number;
  condition: string;
  eta: number; // Estimated Time of Arrival in minutes
};

export default function HospitalDashboard() {
  const { logout } = useContext(AuthContext);
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme || 'light'];

  const [bedsAvailable, setBedsAvailable] = useState(10);
  const [erReady, setErReady] = useState(true);
  
  // 1. حالة جديدة لتخزين الإشعارات القادمة
  const [alerts, setAlerts] = useState<AmbulanceAlert[]>([]);

  // دالة لتغيير عدد الأسرة مع تأثير بصري
  const changeBedCount = (amount: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBedsAvailable(prev => Math.max(0, prev + amount));
  };
  
  // 2. دالة لمحاكاة استقبال إشعار جديد
  const simulateNewAlert = () => {
    const newAlert: AmbulanceAlert = {
      id: Math.random().toString(),
      patientName: "مريض",
      age: Math.floor(Math.random() * 60) + 20,
      condition: "إصابة حادث",
      eta: Math.floor(Math.random() * 15) + 5,
    };
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setAlerts(prev => [newAlert, ...prev]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen
        options={{
          title: 'لوحة تحكم المستشفى',
          headerStyle: { backgroundColor: theme.card },
          headerTitleStyle: { color: theme.text },
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={{ paddingHorizontal: 15, paddingVertical: 5 }}>
              <Text style={{ color: COLORS.danger, fontSize: 16, fontWeight: 'bold' }}>خروج</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollView}>
        
        {/* بطاقة الحالة العامة */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: erReady ? theme.primary : COLORS.danger, borderWidth: 2 }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="hospital-building" size={24} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>الحالة العامة</Text>
          </View>
          <Text style={[styles.statusText, { color: erReady ? theme.primary : COLORS.danger }]}>
            {erReady ? 'قسم الطوارئ جاهز' : 'قسم الطوارئ غير متاح'}
          </Text>
        </View>
        
        {/* بطاقة التحكم بالجاهزية */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.controlRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>تفعيل جاهزية قسم الطوارئ</Text>
            <Switch
              value={erReady}
              onValueChange={setErReady}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor={"#ffffff"}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </View>

        {/* بطاقة الأسرة المتاحة مع أزرار التحكم */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="bed-queen-outline" size={24} color={theme.textSecondary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>الأسرة المتاحة</Text>
          </View>
          <View style={styles.bedControlContainer}>
            <TouchableOpacity style={[styles.bedControlButton, {backgroundColor: theme.accent}]} onPress={() => changeBedCount(1)}>
              <MaterialCommunityIcons name="plus" size={24} color="white" />
            </TouchableOpacity>
            <Text style={[styles.bedCount, { color: theme.text }]}>{bedsAvailable}</Text>
            <TouchableOpacity style={[styles.bedControlButton, {backgroundColor: COLORS.danger}]} onPress={() => changeBedCount(-1)}>
              <MaterialCommunityIcons name="minus" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* بطاقة الإشعارات الديناميكية */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
           <View style={styles.cardHeader}>
             <MaterialCommunityIcons name="bell-ring-outline" size={24} color={theme.accent} />
             <Text style={[styles.cardTitle, { color: theme.text }]}>الإشعارات القادمة</Text>
             {alerts.length > 0 && <View style={[styles.alertCountBadge, {backgroundColor: COLORS.danger}]}><Text style={styles.alertCountText}>{alerts.length}</Text></View>}
           </View>
           {alerts.length === 0 ? (
             <Text style={{color: theme.textSecondary, textAlign: 'center', paddingVertical: 10}}>لا توجد حالات قادمة حالياً.</Text>
           ) : (
             alerts.map(alert => (
               <View key={alert.id} style={[styles.notificationItem, {borderBottomColor: theme.border}]}>
                 <View style={styles.notificationRow}>
                   <Text style={[styles.notificationLabel, {color: theme.text}]}>{alert.patientName}, {alert.age} سنة</Text>
                   <Text style={[styles.notificationValue, {color: theme.textSecondary}]}>ETA: {alert.eta} min</Text>
                 </View>
                 <Text style={[styles.notificationCondition, {color: theme.primary}]}>{alert.condition}</Text>
               </View>
             ))
           )}
           {/* زر المحاكاة (يمكن إزالته لاحقًا) */}
           <TouchableOpacity style={styles.simulateButton} onPress={simulateNewAlert}>
                <Text style={styles.simulateButtonText}>محاكاة وصول إشعار</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#ffffff', // Fallback
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  statusText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
  },
  bedControlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
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
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 80,
  },
  alertCountBadge: {
    marginLeft: 'auto',
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertCountText: {
    color: 'white',
    fontWeight: 'bold',
  },
  notificationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notificationLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationValue: {
    fontSize: 14,
  },
  notificationCondition: {
    fontSize: 14,
    marginTop: 4,
  },
  simulateButton: {
    marginTop: 15,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#e0e0e0', // Fallback
  },
  simulateButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333'
  }
});