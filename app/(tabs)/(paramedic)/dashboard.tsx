// app/(tabs)/(paramedic)/dashboard.tsx
import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { AuthContext } from '../../../context/AuthContext';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// استيراد تصميم الخرائط المخصص
import { mapStyleDark, mapStyleLight } from '../../../constants/mapStyles';

// تعريف الأنواع (Types)
type HospitalStatus = 'available' | 'limited' | 'unavailable';
type Hospital = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status: HospitalStatus;
};

// بيانات المستشفيات
const hospitals: Hospital[] = [
  { id: 1, name: 'مستشفى الجلفة المركزي', lat: 34.673, lng: 3.263, status: 'available' },
  { id: 2, name: 'مستشفى طب العيون', lat: 34.665, lng: 3.255, status: 'limited' },
  { id: 3, name: 'مستشفى الأم والطفل', lat: 34.68, lng: 3.27, status: 'unavailable' },
];

const STATUS_COLORS = {
  available: '#30d158',
  limited: '#ff9f0a',
  unavailable: '#ff453a',
};

// --- المكون الرئيسي ---
export default function ParamedicDashboard() {
  const { logout } = useContext(AuthContext);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // 1. حالات جديدة للموقع والتحميل والمستشفى المختار
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const mapRef = useRef<MapView>(null);

  // 2. طلب إذن الموقع عند تحميل الشاشة
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('الإذن مطلوب', 'يرجى السماح بالوصول للموقع لكي يعمل التطبيق بشكل صحيح.');
        setIsLoading(false);
        return;
      }
      fetchLocation();
    })();
  }, []);

  const fetchLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setIsLoading(false);
      // تحديث الخريطة لتتمركز حول الموقع الجديد
      animateToLocation(currentLocation.coords.latitude, currentLocation.coords.longitude);
    } catch (error) {
      Alert.alert("خطأ", "لم نتمكن من تحديد موقعك الحالي.");
      setIsLoading(false);
    }
  };

  const animateToLocation = (latitude: number, longitude: number) => {
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 1000);
  };
  
  // شاشة التحميل
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? '#000' : '#f0f2f5' }]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#FFF' : '#007AFF'} />
        <Text style={[styles.loadingText, { color: isDarkMode ? '#FFF' : '#000' }]}>جارٍ تحديد موقعك...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'خريطة الطوارئ',
          headerStyle: { backgroundColor: isDarkMode ? '#1c1c1e' : '#ffffff' },
          headerTitleStyle: { color: isDarkMode ? '#FFF' : '#000' },
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={{ paddingHorizontal: 15 }}>
              <Text style={{ color: STATUS_COLORS.unavailable, fontSize: 16, fontWeight: 'bold' }}>خروج</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={isDarkMode ? mapStyleDark : mapStyleLight}
        initialRegion={{
          latitude: location?.coords.latitude || 34.673,
          longitude: location?.coords.longitude || 3.263,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={() => setSelectedHospital(null)} // إخفاء البطاقة عند الضغط على الخريطة
      >
        {/* مؤشر موقع المسعف */}
        {location && (
          <Marker coordinate={location.coords} title="موقعي الحالي">
            <View style={styles.myLocationMarker} />
          </Marker>
        )}

        {/* مؤشرات المستشفيات */}
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            coordinate={{ latitude: hospital.lat, longitude: hospital.lng }}
            title={hospital.name}
            onPress={() => setSelectedHospital(hospital)} // إظهار البطاقة عند الضغط
          >
            <View style={[styles.markerContainer, { backgroundColor: STATUS_COLORS[hospital.status] }]}>
              <MaterialCommunityIcons name="hospital-box" size={24} color="white" />
            </View>
          </Marker>
        ))}
      </MapView>
      
      {/* 3. بطاقة تفاصيل المستشفى (تظهر عند الاختيار) */}
      {selectedHospital && (
        <View style={[styles.bottomSheet, { backgroundColor: isDarkMode ? '#1c1c1e' : '#fff' }]}>
          <Text style={[styles.hospitalName, {color: isDarkMode ? '#fff' : '#000'}]}>{selectedHospital.name}</Text>
          <View style={[styles.statusBadge, {backgroundColor: STATUS_COLORS[selectedHospital.status]}]}>
             <Text style={styles.statusBadgeText}>{selectedHospital.status}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.alertButton, {backgroundColor: selectedHospital.status === 'available' ? '#007AFF' : 'gray'}]}
            disabled={selectedHospital.status !== 'available'}
            onPress={() => Alert.alert("إرسال تنبيه", `تم إرسال تنبيه إلى ${selectedHospital.name}`)}
          >
            <MaterialCommunityIcons name="bell-ring" size={20} color="white" style={{marginRight: 8}}/>
            <Text style={styles.alertButtonText}>إرسال تنبيه الآن</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.fab} onPress={fetchLocation}>
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}


// --- الأنماط المحسّنة ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  myLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  markerContainer: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
  },
  hospitalName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 15,
  },
  statusBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  alertButton: {
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});