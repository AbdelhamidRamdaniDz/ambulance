import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Text, useColorScheme, TouchableOpacity,
  ActivityIndicator, Alert, SafeAreaView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mapStyleDark, mapStyleLight } from '../../constants/mapStyles';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

// --- ⚠️ تأكد من أن هذا الرابط هو رابط Ngrok الحالي الخاص بك ---
const API_BASE_URL = 'https://3510-129-45-33-55.ngrok-free.app/api'; 

type HospitalData = {
  _id: string; 
  name: string;
  location?: { coordinates: [number, number] };
  availabilityStatus: 'available' | 'limited' | 'unavailable';
};

export default function ParamedicDashboard() {
  const auth = useContext(AuthContext) as AuthContextType;
  const colorScheme = useColorScheme() || 'light';
  const theme = COLORS[colorScheme];
  const shadow = SHADOWS[colorScheme].large;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hospitals, setHospitals] = useState<HospitalData[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<HospitalData | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location services.');
        setIsLoading(false);
        return;
      }
      
      try {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        animateToLocation(currentLocation.coords.latitude, currentLocation.coords.longitude);
      } catch (error) {
        Alert.alert('Location Error', 'Could not fetch your current location.');
      }

      if (!auth.authToken) {
        setIsLoading(false);
        return;
      }
      try {
        // --- تم تعديل الرابط هنا إلى المسار الصحيح للمسعف ---
        const response = await fetch(`${API_BASE_URL}/status`, {
            headers: { 'Authorization': `Bearer ${auth.authToken}` }
        });
        const data = await response.json();
        if (data.success) {
            const hospitalStatuses = data.data.map(item => ({
                _id: item.hospital._id,
                name: item.hospital.name,
                location: item.hospital.location,
                availabilityStatus: item.isERAvailable ? 'available' : 'unavailable',
            }));
            setHospitals(hospitalStatuses);
        } else {
             Alert.alert('Error', data.error || 'Failed to fetch hospital data.');
        }
      } catch(error) {
           Alert.alert('API Error', 'Could not connect to the server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [auth.authToken]);

  const animateToLocation = (latitude: number, longitude: number) => {
    mapRef.current?.animateToRegion({
        latitude, longitude,
        latitudeDelta: 0.05, longitudeDelta: 0.05,
    }, 1000);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={COLORS.roles.paramedic} />
        <Text style={[styles.loadingText, { color: theme.text }]}>جارٍ جلب البيانات...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true, title: 'خريطة الطوارئ',
          headerStyle: { backgroundColor: theme.card },
          headerTitleStyle: { color: theme.text, ...FONTS.title },
          headerRight: () => (
            <TouchableOpacity onPress={auth.logout} style={{ paddingHorizontal: SIZES.padding }}>
              <MaterialCommunityIcons name="logout" size={24} color={COLORS.status.unavailable} />
            </TouchableOpacity>
          ),
        }}
      />
      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={colorScheme === 'dark' ? mapStyleDark : mapStyleLight}
        initialRegion={{
            latitude: location?.coords.latitude || 34.673,
            longitude: location?.coords.longitude || 3.263,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
        }}
        onPress={() => setSelectedHospital(null)}
      >
        {location && <Marker coordinate={location.coords} title="My Location" pinColor={COLORS.roles.paramedic} />}
        
        {hospitals.filter(h => h.location?.coordinates).map((hospital) => (
          <Marker
            key={hospital._id}
            coordinate={{ 
                latitude: hospital.location.coordinates[1], 
                longitude: hospital.location.coordinates[0] 
            }}
            title={hospital.name}
            onPress={(e) => { e.stopPropagation(); setSelectedHospital(hospital); }}
          >
            <View style={[styles.markerContainer, { backgroundColor: COLORS.status[hospital.availabilityStatus] }]}>
              <MaterialCommunityIcons name="hospital-box" size={24} color="white" />
            </View>
          </Marker>
        ))}
      </MapView>

      {selectedHospital && (
        <View style={[styles.bottomSheet, { backgroundColor: theme.card, paddingBottom: insets.bottom + SIZES.base, ...shadow }]}>
           <Text style={[styles.hospitalName, { color: theme.text }]}>{selectedHospital.name}</Text>
           <TouchableOpacity
             style={[styles.alertButton, { backgroundColor: selectedHospital.availabilityStatus === 'available' ? COLORS.roles.paramedic : 'gray' }]}
             disabled={selectedHospital.availabilityStatus !== 'available'}
             onPress={() => router.push({
                pathname: '/add-case',
                params: { hospitalId: selectedHospital._id, hospitalName: selectedHospital.name }
             })}
           >
             <MaterialCommunityIcons name="send" size={22} color="white" />
             <Text style={styles.alertButtonText}>إنشاء حالة لهذا المستشفى</Text>
           </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...FONTS.body, marginTop: SIZES.medium },
  markerContainer: { padding: SIZES.base, borderRadius: 20 },
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: SIZES.padding,
    borderTopLeftRadius: SIZES.radiusXLarge,
    borderTopRightRadius: SIZES.radiusXLarge,
  },
  hospitalName: { ...FONTS.h3, textAlign: 'center', marginBottom: SIZES.padding },
  alertButton: {
    padding: SIZES.padding,
    borderRadius: SIZES.radiusLarge,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.small
  },
  alertButtonText: { color: 'white', ...FONTS.button },
});
