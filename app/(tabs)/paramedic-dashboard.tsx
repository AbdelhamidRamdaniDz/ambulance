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
import { AuthContext } from '../../context/AuthContext';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mapStyleDark, mapStyleLight } from '../../constants/mapStyles';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

type HospitalStatus = 'available' | 'limited' | 'unavailable';
type Hospital = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status: HospitalStatus;
};

const hospitalsData: Hospital[] = [
    { id: 1, name: 'مستشفى الجلفة المركزي', lat: 34.673, lng: 3.263, status: 'available' },
    { id: 2, name: 'مستشفى طب العيون', lat: 34.665, lng: 3.255, status: 'limited' },
    { id: 3, name: 'مستشفى الأم والطفل', lat: 34.68, lng: 3.27, status: 'unavailable' },
];

export default function ParamedicDashboard() {
  const { logout } = useContext(AuthContext);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const theme = COLORS[colorScheme || 'light'];
  const insets = useSafeAreaInsets();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // هذا الكود يطلب إذن الموقع عند تحميل الشاشة
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
        if(isLoading) setIsLoading(false);
        animateToLocation(currentLocation.coords.latitude, currentLocation.coords.longitude);
    } catch (error) {
        Alert.alert("خطأ", "لم نتمكن من تحديد موقعك الحالي.");
        if(isLoading) setIsLoading(false);
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

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={COLORS.roles.paramedic} />
        <Text style={[styles.loadingText, { color: theme.text }]}>جارٍ تحديد موقعك...</Text>
      </View>
    );
  }

  return (
    // استخدام View عادي هنا لأن SafeAreaView ستُطبق على العناصر الداخلية
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'خريطة الطوارئ',
          headerStyle: { backgroundColor: theme.card },
          headerTitleStyle: { color: theme.text, ...FONTS.title },
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={{ paddingHorizontal: SIZES.padding / 1.5 }}>
              <Text style={{ color: COLORS.status.unavailable, ...FONTS.h3, fontWeight: 'bold' }}>خروج</Text>
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
        onPress={() => setSelectedHospital(null)}
      >
        {location && (
          <Marker coordinate={location.coords} title="موقعي الحالي">
            <View style={styles.myLocationMarker} />
          </Marker>
        )}
        {hospitalsData.map((hospital) => (
          <Marker
            key={hospital.id}
            coordinate={{ latitude: hospital.lat, longitude: hospital.lng }}
            title={hospital.name}
            onPress={(e) => { e.stopPropagation(); setSelectedHospital(hospital); }}
          >
            <View style={[styles.markerContainer, { backgroundColor: COLORS.status[hospital.status] }]}>
              <MaterialCommunityIcons name="hospital-box" size={24} color="white" />
            </View>
          </Marker>
        ))}
      </MapView>

      {selectedHospital && (
        <View style={[styles.bottomSheet, { backgroundColor: theme.card, paddingBottom: insets.bottom + SIZES.base }]}>
           <Text style={[styles.hospitalName, { color: theme.text }]}>{selectedHospital.name}</Text>
           <View style={[styles.statusBadge, { backgroundColor: COLORS.status[selectedHospital.status] }]}>
             <Text style={styles.statusBadgeText}>{selectedHospital.status}</Text>
           </View>
           <TouchableOpacity
             style={[styles.alertButton, { backgroundColor: selectedHospital.status === 'available' ? COLORS.roles.paramedic : 'gray' }]}
             disabled={selectedHospital.status !== 'available'}
             onPress={() => Alert.alert('إرسال تنبيه', `تم إرسال تنبيه إلى ${selectedHospital.name}`)}
           >
             <MaterialCommunityIcons name="bell-ring" size={20} color="white" style={{ marginRight: SIZES.base }} />
             <Text style={styles.alertButtonText}>إرسال تنبيه الآن</Text>
           </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={[styles.recenterFab, { bottom: (selectedHospital ? 170 : 0) + insets.bottom + SIZES.base * 2 }]} onPress={fetchLocation}>
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...FONTS.body, marginTop: SIZES.base * 1.5 },
  myLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.roles.paramedic,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  markerContainer: {
    padding: SIZES.base,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recenterFab: {
    position: 'absolute',
    right: SIZES.padding,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.roles.paramedic,
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
    padding: SIZES.padding,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -2 },
  },
  hospitalName: {
    ...FONTS.h2,
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding / 1.5,
  },
  statusBadgeText: {
    color: 'white',
    ...FONTS.caption,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  alertButton: {
    padding: SIZES.padding / 1.5,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertButtonText: {
    color: 'white',
    ...FONTS.h3,
  },
});