import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  View, StyleSheet, Text, useColorScheme, TouchableOpacity,
  ActivityIndicator, Alert, SafeAreaView, Platform
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mapStyleDark, mapStyleLight } from '../../constants/mapStyles';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import API from '../../lib/axios';

// --- واجهات البيانات المحسنة ---
interface BedStatus {
  total: number;
  occupied: number;
}

interface HospitalData {
  _id: string;
  name: string;
  location?: { coordinates: [number, number] };
  isERAvailable: boolean;
  availableBeds?: {
    'العناية المركزة (ICU)'?: BedStatus;
    'الطوارئ (Emergency)'?: BedStatus;
    general?: BedStatus;
  };
}

interface HospitalStatusResponse {
    _id: string;
    isERAvailable: boolean;
    availableBeds: Record<string, BedStatus>;
    hospital: {
        _id: string;
        name: string;
        location?: { coordinates: [number, number] };
    }
}


// --- المكون الرئيسي ---
export default function ParamedicDashboard() {
  const auth = useContext(AuthContext) as AuthContextType;
  const colorScheme = useColorScheme() || 'light';
  const theme = COLORS[colorScheme];
  const shadow = SHADOWS[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hospitals, setHospitals] = useState<HospitalData[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<HospitalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  // --- دالة جلب البيانات ---
  const fetchInitialData = useCallback(async () => {
    // 1. طلب صلاحيات الموقع
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('يرجى تمكين خدمات الموقع للمتابعة.');
      setIsLoading(false);
      return;
    }

    // 2. جلب الموقع الحالي للمستخدم
    try {
      const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(currentLocation);
      animateToLocation(currentLocation.coords.latitude, currentLocation.coords.longitude);
    } catch (e) {
      setError('لم نتمكن من تحديد موقعك الحالي.');
    }

    // 3. جلب بيانات المستشفيات
    if (!auth.authToken) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await API.get('/paramedic/hospital-statuses', {
        headers: { 'Authorization': `Bearer ${auth.authToken}` }
      });

      const data = response.data;
      if (data.success) {
        const hospitalStatuses = data.data.map((item: HospitalStatusResponse) => ({
          _id: item.hospital._id,
          name: item.hospital.name,
          location: item.hospital.location,
          isERAvailable: item.isERAvailable,
          availableBeds: item.availableBeds,
        }));
        setHospitals(hospitalStatuses);
      } else {
        setError(data.message || 'فشل في جلب بيانات المستشفيات.');
      }
    } catch (e) {
      setError('لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.');
    } finally {
      setIsLoading(false);
    }
  }, [auth.authToken]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // --- تحريك الخريطة ---
  const animateToLocation = (latitude: number, longitude: number) => {
    mapRef.current?.animateToRegion({
      latitude, longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }, 1000);
  };

  // --- منطق العرض ---
  if (isLoading) {
    return <LoadingOverlay theme={theme} />;
  }
  
  if (error) {
    return <ErrorOverlay theme={theme} message={error} onRetry={fetchInitialData} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Header onLogout={auth.logout} theme={theme} />
      
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={colorScheme === 'dark' ? mapStyleDark : mapStyleLight}
        initialRegion={{
          latitude: location?.coords.latitude || 36.77,
          longitude: location?.coords.longitude || 3.05,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onPress={() => setSelectedHospital(null)}
      >
        {hospitals
          .filter(h => h.location && h.location.coordinates && h.location.coordinates.length === 2)
          .map((hospital) => (
          <Marker
            key={hospital._id}
            coordinate={{
              latitude: hospital.location!.coordinates[1],
              longitude: hospital.location!.coordinates[0],
            }}
            onPress={(e) => { e.stopPropagation(); setSelectedHospital(hospital); }}
          >
            <MarkerIcon isAvailable={hospital.isERAvailable} />
          </Marker>
        ))}
      </MapView>

      <MyLocationButton onPress={() => location && animateToLocation(location.coords.latitude, location.coords.longitude)} />
      
      {selectedHospital && (
        <BottomSheet
          hospital={selectedHospital}
          theme={theme}
          shadow={shadow.large}
          insets={insets}
          onSelect={() => router.push({
            pathname: '/add-case',
            params: { hospitalId: selectedHospital._id, hospitalName: selectedHospital.name }
          })}
        />
      )}
    </SafeAreaView>
  );
}

// --- المكونات المساعدة ---

const Header = ({ onLogout, theme }: { onLogout: () => void; theme: any }) => (
  <View style={[styles.header, { backgroundColor: theme.card }]}>
    <View>
      <Text style={[styles.headerTitle, { color: theme.text }]}>خريطة الطوارئ</Text>
      <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>أقرب المستشفيات المتاحة</Text>
    </View>
    <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
      <MaterialCommunityIcons name="logout" size={26} color={COLORS.status.unavailable} />
    </TouchableOpacity>
  </View>
);

const MarkerIcon = ({ isAvailable }: { isAvailable: boolean }) => (
  <View style={[styles.markerWrapper, isAvailable ? styles.markerAvailable : styles.markerUnavailable]}>
    <MaterialCommunityIcons name="hospital-box" size={26} color="white" />
  </View>
);

const MyLocationButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.locationButton} onPress={onPress}>
    <MaterialCommunityIcons name="crosshairs-gps" size={24} color={COLORS.primary} />
  </TouchableOpacity>
);

const BottomSheet = ({ hospital, theme, shadow, insets, onSelect }: any) => {
    const beds = hospital.availableBeds;
    return (
      <View style={[styles.bottomSheet, { backgroundColor: theme.card, paddingBottom: insets.bottom + SIZES.base, ...shadow }]}>
        <Text style={[styles.hospitalName, { color: theme.text }]}>{hospital.name}</Text>
        
        <View style={styles.statusRow}>
          <Text style={[styles.statusLabel, {color: theme.textSecondary}]}>حالة الطوارئ:</Text>
          <View style={[styles.statusBadge, { backgroundColor: hospital.isERAvailable ? `${COLORS.status.available}20` : `${COLORS.status.unavailable}20` }]}>
              <View style={[styles.statusDot, { backgroundColor: hospital.isERAvailable ? COLORS.status.available : COLORS.status.unavailable }]} />
              <Text style={[styles.statusText, { color: hospital.isERAvailable ? COLORS.status.available : COLORS.status.unavailable }]}>
                  {hospital.isERAvailable ? 'متاح' : 'غير متاح'}
              </Text>
          </View>
        </View>

        {beds && <View style={styles.bedsContainer}>
            <BedInfo label="عناية مركزة" status={beds['العناية المركزة (ICU)']} theme={theme} />
            <BedInfo label="طوارئ" status={beds['الطوارئ (Emergency)']} theme={theme} />
        </View>}

        <TouchableOpacity
          style={[styles.alertButton, { backgroundColor: hospital.isERAvailable ? COLORS.roles.paramedic : 'gray' }]}
          disabled={!hospital.isERAvailable}
          onPress={onSelect}
        >
          <MaterialCommunityIcons name="send-circle-outline" size={24} color="white" />
          <Text style={styles.alertButtonText}>إنشاء حالة لهذا المستشفى</Text>
        </TouchableOpacity>
      </View>
    )
};

const BedInfo = ({ label, status, theme }: { label: string, status?: BedStatus, theme: any }) => {
    if (!status) return null;
    const available = status.total - status.occupied;
    return (
        <View style={[styles.bedInfoBox, {backgroundColor: theme.background}]}>
            <Text style={[styles.bedLabel, {color: theme.textSecondary}]}>{label}</Text>
            <Text style={[styles.bedCount, {color: theme.text}]}>{available}</Text>
            <Text style={[styles.bedTotal, {color: theme.textSecondary}]}>/ {status.total} متاح</Text>
        </View>
    )
};

const LoadingOverlay = ({ theme }: { theme: any }) => (
    <View style={[styles.overlay, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={COLORS.roles.paramedic} />
      <Text style={[styles.overlayText, { color: theme.text }]}>جارٍ جلب البيانات...</Text>
    </View>
);

const ErrorOverlay = ({ theme, message, onRetry }: { theme: any, message: string, onRetry: () => void }) => (
    <View style={[styles.overlay, { backgroundColor: theme.background }]}>
      <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.status.unavailable} />
      <Text style={[styles.overlayText, { color: theme.text, textAlign: 'center' }]}>{message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
      </TouchableOpacity>
    </View>
);

// --- الأنماط ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding * 2 },
  overlayText: { ...FONTS.h4, marginTop: SIZES.medium, color: '#333' },
  retryButton: { backgroundColor: COLORS.primary, paddingVertical: SIZES.base, paddingHorizontal: SIZES.large, borderRadius: SIZES.radius, marginTop: SIZES.large },
  retryButtonText: { ...FONTS.button, color: 'white' },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.padding, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { ...FONTS.h3, textAlign: 'right'},
  headerSubtitle: { ...FONTS.body, textAlign: 'right'},
  logoutButton: {},
  markerWrapper: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white', ...SHADOWS.dark.medium},
  markerAvailable: { backgroundColor: COLORS.status.available },
  markerUnavailable: { backgroundColor: COLORS.status.unavailable },
  locationButton: { position: 'absolute', bottom: 180, right: 20, backgroundColor: 'white', padding: 12, borderRadius: 30, ...SHADOWS.dark.large },
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SIZES.padding, borderTopLeftRadius: SIZES.radiusXLarge, borderTopRightRadius: SIZES.radiusXLarge },
  hospitalName: { ...FONTS.h2, textAlign: 'center', marginBottom: SIZES.medium },
  statusRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: SIZES.small, marginBottom: SIZES.medium},
  statusLabel: { ...FONTS.body, fontWeight: 'bold' },
  statusBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 10, borderRadius: SIZES.radius },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { ...FONTS.body, fontSize: SIZES.small, fontWeight: 'bold' },
  bedsContainer: { flexDirection: 'row', justifyContent: 'space-around', gap: SIZES.medium, marginBottom: SIZES.padding },
  bedInfoBox: { flex: 1, padding: SIZES.medium, borderRadius: SIZES.radius, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  bedLabel: { ...FONTS.body, fontSize: SIZES.small, marginBottom: 4 },
  bedCount: { ...FONTS.h3 },
  bedTotal: { ...FONTS.body, fontSize: 10 },
  alertButton: { padding: SIZES.padding, borderRadius: SIZES.radiusLarge, flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: SIZES.small },
  alertButtonText: { color: 'white', ...FONTS.button },
  loadingContainer: {},
  loadingText: {}
});