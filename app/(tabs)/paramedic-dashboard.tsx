import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  View, StyleSheet, Text, useColorScheme, TouchableOpacity,
  ActivityIndicator, Alert, SafeAreaView, Platform, Animated,
  Dimensions, ScrollView
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mapStyleDark, mapStyleLight } from '../../constants/mapStyles';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import API from '../../lib/axios';

const { width, height } = Dimensions.get('window');

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
  distance?: number;
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
  const [showStats, setShowStats] = useState(false);
  const [filterAvailable, setFilterAvailable] = useState(false);
  
  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // حساب المسافة بين نقطتين
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // --- دالة جلب البيانات ---
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('يرجى تمكين خدمات الموقع للمتابعة.');
      setIsLoading(false);
      return;
    }

    try {
      const currentLocation = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.High 
      });
      setLocation(currentLocation);
      animateToLocation(currentLocation.coords.latitude, currentLocation.coords.longitude);
      
      // تحريك التطبيق بسلاسة
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
      
    } catch (e) {
      setError('لم نتمكن من تحديد موقعك الحالي.');
    }

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
        const hospitalStatuses = data.data.map((item: HospitalStatusResponse) => {
          const hospital = {
            _id: item.hospital._id,
            name: item.hospital.name,
            location: item.hospital.location,
            isERAvailable: item.isERAvailable,
            availableBeds: item.availableBeds,
            distance: 0
          };
          
          // حساب المسافة إذا كان الموقع متاحاً
          if (location && hospital.location?.coordinates) {
            hospital.distance = calculateDistance(
              location.coords.latitude,
              location.coords.longitude,
              hospital.location.coordinates[1],
              hospital.location.coordinates[0]
            );
          }
          
          return hospital;
        });
        
        // ترتيب المستشفيات حسب المسافة
        hospitalStatuses.sort((a: HospitalData, b: HospitalData) => (a.distance || 0) - (b.distance || 0));
        setHospitals(hospitalStatuses);
      } else {
        setError(data.message || 'فشل في جلب بيانات المستشفيات.');
      }
    } catch (e) {
      setError('لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.');
    } finally {
      setIsLoading(false);
    }
  }, [auth.authToken, location]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // --- تحريك الخريطة ---
  const animateToLocation = (latitude: number, longitude: number) => {
    mapRef.current?.animateToRegion({
      latitude, longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 1000);
  };

  // --- تصفية المستشفيات ---
  const filteredHospitals = filterAvailable 
    ? hospitals.filter(h => h.isERAvailable)
    : hospitals;

  // --- إحصائيات سريعة ---
  const stats = {
    total: hospitals.length,
    available: hospitals.filter(h => h.isERAvailable).length,
    unavailable: hospitals.filter(h => !h.isERAvailable).length,
    nearest: hospitals[0]
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
      
      {/* Header محسن */}
      <Animated.View 
        style={[
          { opacity: fadeAnim, transform: [{ translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-50, 0]
          })}] }
        ]}
      >
        <Header 
          onLogout={auth.logout} 
          theme={theme} 
          shadow={shadow}
          stats={stats}
          showStats={showStats}
          onToggleStats={() => setShowStats(!showStats)}
        />
      </Animated.View>

      {/* Stats Panel */}
      {showStats && (
        <Animated.View
          style={[
            styles.statsPanel,
            { backgroundColor: theme.card, borderColor: theme.border, ...shadow.medium }
          ]}
        >
          <StatsPanel stats={stats} theme={theme} />
        </Animated.View>
      )}

      {/* Filter Controls */}
      <Animated.View 
        style={[
          styles.filterContainer,
          { opacity: fadeAnim }
        ]}
      >
        <FilterControls 
          filterAvailable={filterAvailable}
          onToggleFilter={() => setFilterAvailable(!filterAvailable)}
          theme={theme}
          shadow={shadow}
        />
      </Animated.View>

      {/* الخريطة */}
      <Animated.View 
        style={[
          styles.mapContainer,
          { opacity: fadeAnim }
        ]}
      >
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
          {/* دائرة حول موقع المستخدم */}
          {location && (
            <Circle
              center={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              radius={5000} // 5 كم
              strokeColor={`${COLORS.accent.primary}40`}
              fillColor={`${COLORS.accent.primary}10`}
              strokeWidth={2}
            />
          )}
          
          {filteredHospitals
            .filter(h => h.location && h.location.coordinates && h.location.coordinates.length === 2)
            .map((hospital) => (
            <Marker
              key={hospital._id}
              coordinate={{
                latitude: hospital.location!.coordinates[1],
                longitude: hospital.location!.coordinates[0],
              }}
              onPress={(e) => { 
                e.stopPropagation(); 
                setSelectedHospital(hospital);
                // تحريك الخريطة للمستشفى المحدد
                animateToLocation(
                  hospital.location!.coordinates[1],
                  hospital.location!.coordinates[0]
                );
              }}
            >
              <EnhancedMarkerIcon 
                isAvailable={hospital.isERAvailable} 
                distance={hospital.distance}
                isSelected={selectedHospital?._id === hospital._id}
              />
            </Marker>
          ))}
        </MapView>
      </Animated.View>

      {/* أزرار التحكم */}
      <ControlButtons 
        onMyLocation={() => location && animateToLocation(location.coords.latitude, location.coords.longitude)}
        onRefresh={fetchInitialData}
        theme={theme}
        shadow={shadow}
      />
      
      {/* Bottom Sheet محسن */}
      {selectedHospital && (
        <EnhancedBottomSheet
          hospital={selectedHospital}
          theme={theme}
          shadow={shadow.large}
          insets={insets}
          onSelect={() => router.push({
            pathname: '/add-case',
            params: { hospitalId: selectedHospital._id, hospitalName: selectedHospital.name }
          })}
          onClose={() => setSelectedHospital(null)}
        />
      )}
    </SafeAreaView>
  );
}

// --- المكونات المساعدة المحسنة ---

const Header = ({ onLogout, theme, shadow, stats, showStats, onToggleStats }: any) => (
  <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border, ...shadow.medium }]}>
    <View style={styles.headerContent}>
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={onToggleStats} style={styles.statsButton}>
          <MaterialCommunityIcons 
            name={showStats ? "chart-line" : "chart-line-variant"} 
            size={24} 
            color={COLORS.accent.primary} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerCenter}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>خريطة الطوارئ</Text>
        <View style={styles.headerStats}>
          <View style={[styles.quickStat, { backgroundColor: `${COLORS.status.available}20` }]}>
            <Text style={[styles.quickStatNumber, { color: COLORS.status.available }]}>
              {stats.available}
            </Text>
            <Text style={[styles.quickStatLabel, { color: COLORS.status.available }]}>متاح</Text>
          </View>
          <View style={[styles.quickStat, { backgroundColor: `${COLORS.status.unavailable}20` }]}>
            <Text style={[styles.quickStatNumber, { color: COLORS.status.unavailable }]}>
              {stats.unavailable}
            </Text>
            <Text style={[styles.quickStatLabel, { color: COLORS.status.unavailable }]}>مشغول</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <MaterialCommunityIcons name="logout" size={24} color={COLORS.status.unavailable} />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const StatsPanel = ({ stats, theme }: any) => (
  <View style={styles.statsContent}>
    <View style={styles.statItem}>
      <MaterialCommunityIcons name="hospital-building" size={24} color={theme.text} />
      <Text style={[styles.statNumber, { color: theme.text }]}>{stats.total}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>إجمالي المستشفيات</Text>
    </View>
    
    <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
    
    <View style={styles.statItem}>
      <MaterialCommunityIcons name="map-marker-distance" size={24} color={COLORS.accent.primary} />
      <Text style={[styles.statNumber, { color: COLORS.accent.primary }]}>
        {stats.nearest?.distance?.toFixed(1) || '--'}
      </Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>كم للأقرب</Text>
    </View>
  </View>
);

const FilterControls = ({ filterAvailable, onToggleFilter, theme, shadow }: any) => (
  <View style={styles.filterControlsContainer}>
    <TouchableOpacity
      style={[
        styles.filterButton,
        { 
          backgroundColor: filterAvailable ? COLORS.accent.primary : theme.card,
          borderColor: filterAvailable ? COLORS.accent.primary : theme.border,
          ...shadow.small
        }
      ]}
      onPress={onToggleFilter}
    >
      <MaterialCommunityIcons 
        name="filter-variant" 
        size={18} 
        color={filterAvailable ? 'white' : theme.text} 
      />
      <Text style={[
        styles.filterButtonText, 
        { color: filterAvailable ? 'white' : theme.text }
      ]}>
        {filterAvailable ? 'المتاحة فقط' : 'عرض الكل'}
      </Text>
    </TouchableOpacity>
  </View>
);

const EnhancedMarkerIcon = ({ isAvailable, distance, isSelected }: any) => (
  <Animated.View style={[
    styles.markerWrapper,
    isAvailable ? styles.markerAvailable : styles.markerUnavailable,
    isSelected && styles.markerSelected,
    { transform: [{ scale: isSelected ? 1.2 : 1 }] }
  ]}>
    <MaterialCommunityIcons 
      name="hospital-box" 
      size={isSelected ? 28 : 24} 
      color="white" 
    />
    {distance !== undefined && distance < 10 && (
      <View style={styles.distanceBadge}>
        <Text style={styles.distanceText}>{distance.toFixed(1)}km</Text>
      </View>
    )}
  </Animated.View>
);

const ControlButtons = ({ onMyLocation, onRefresh, theme, shadow }: any) => (
  <View style={styles.controlButtonsContainer}>
    <TouchableOpacity 
      style={[styles.controlButton, { backgroundColor: theme.card, ...shadow.medium }]} 
      onPress={onMyLocation}
    >
      <MaterialCommunityIcons name="crosshairs-gps" size={24} color={COLORS.accent.primary} />
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={[styles.controlButton, { backgroundColor: theme.card, ...shadow.medium }]} 
      onPress={onRefresh}
    >
      <MaterialCommunityIcons name="refresh" size={24} color={COLORS.accent.primary} />
    </TouchableOpacity>
  </View>
);

const EnhancedBottomSheet = ({ hospital, theme, shadow, insets, onSelect, onClose }: any) => {
  const beds = hospital.availableBeds;
  const slideUpAnim = useRef(new Animated.Value(300)).current;
  
  useEffect(() => {
    Animated.spring(slideUpAnim, {
      toValue: 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.bottomSheet, 
        { 
          backgroundColor: theme.card, 
          paddingBottom: insets.bottom + SIZES.base, 
          transform: [{ translateY: slideUpAnim }],
          ...shadow 
        }
      ]}
    >
      <View style={styles.bottomSheetHeader}>
        <View style={[styles.handleBar, { backgroundColor: theme.border }]} />
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hospitalHeader}>
          <Text style={[styles.hospitalName, { color: theme.text }]}>{hospital.name}</Text>
          {hospital.distance && (
            <View style={styles.distanceContainer}>
              <MaterialCommunityIcons name="map-marker-distance" size={16} color={theme.textSecondary} />
              <Text style={[styles.distanceInfo, { color: theme.textSecondary }]}>
                {hospital.distance.toFixed(1)} كم من موقعك
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.statusSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>حالة الطوارئ</Text>
          <View style={[
            styles.statusCard,
            { 
              backgroundColor: hospital.isERAvailable 
                ? `${COLORS.status.available}15` 
                : `${COLORS.status.unavailable}15`,
              borderColor: hospital.isERAvailable 
                ? COLORS.status.available 
                : COLORS.status.unavailable
            }
          ]}>
            <MaterialCommunityIcons 
              name={hospital.isERAvailable ? "check-circle" : "close-circle"} 
              size={32} 
              color={hospital.isERAvailable ? COLORS.status.available : COLORS.status.unavailable} 
            />
            <View style={styles.statusContent}>
              <Text style={[
                styles.statusTitle, 
                { color: hospital.isERAvailable ? COLORS.status.available : COLORS.status.unavailable }
              ]}>
                {hospital.isERAvailable ? 'قسم الطوارئ متاح' : 'قسم الطوارئ مشغول'}
              </Text>
              <Text style={[styles.statusSubtitle, { color: theme.textSecondary }]}>
                {hospital.isERAvailable 
                  ? 'يمكن استقبال حالات طارئة' 
                  : 'لا يمكن استقبال حالات جديدة حالياً'
                }
              </Text>
            </View>
          </View>
        </View>

        {beds && Object.keys(beds).length > 0 && (
          <View style={styles.bedsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>الأسرة المتاحة</Text>
            <View style={styles.bedsGrid}>
              <EnhancedBedInfo 
                icon="heart-pulse" 
                label="عناية مركزة" 
                status={beds['العناية المركزة (ICU)']} 
                theme={theme} 
              />
              <EnhancedBedInfo 
                icon="medical-bag" 
                label="طوارئ" 
                status={beds['الطوارئ (Emergency)']} 
                theme={theme} 
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.actionButton,
            { 
              backgroundColor: hospital.isERAvailable ? COLORS.roles.paramedic : theme.border,
              opacity: hospital.isERAvailable ? 1 : 0.6
            }
          ]}
          disabled={!hospital.isERAvailable}
          onPress={onSelect}
        >
          <MaterialCommunityIcons 
            name="ambulance" 
            size={24} 
            color={hospital.isERAvailable ? "white" : theme.textSecondary} 
          />
          <Text style={[
            styles.actionButtonText, 
            { color: hospital.isERAvailable ? "white" : theme.textSecondary }
          ]}>
            إنشاء حالة طارئة
          </Text>
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={20} 
            color={hospital.isERAvailable ? "white" : theme.textSecondary} 
          />
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
};

const EnhancedBedInfo = ({ icon, label, status, theme }: any) => {
  if (!status || typeof status.total !== 'number' || typeof status.occupied !== 'number') return null;
  
  const available = status.total - status.occupied;
  const percentage = status.total > 0 ? (available / status.total) * 100 : 0;
  const color = available > 0 ? COLORS.status.available : COLORS.status.unavailable;
  
  return (
    <View style={[styles.bedCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <View style={styles.bedCardHeader}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
        <Text style={[styles.bedCardLabel, { color: theme.text }]}>{label}</Text>
      </View>
      
      <View style={styles.bedCardContent}>
        <Text style={[styles.bedCardNumber, { color: color }]}>{available}</Text>
        <Text style={[styles.bedCardTotal, { color: theme.textSecondary }]}>من {status.total}</Text>
      </View>
      
      <View style={[styles.bedProgressBar, { backgroundColor: `${color}20` }]}>
        <View 
          style={[
            styles.bedProgress, 
            { backgroundColor: color, width: `${percentage}%` }
          ]} 
        />
      </View>
    </View>
  );
};

const LoadingOverlay = ({ theme }: { theme: any }) => (
  <View style={[styles.overlay, { backgroundColor: theme.background }]}>
    <ActivityIndicator size="large" color={COLORS.roles.paramedic} />
    <Text style={[styles.overlayText, { color: theme.text }]}>جارٍ تحميل خريطة الطوارئ...</Text>
  </View>
);

const ErrorOverlay = ({ theme, message, onRetry }: { theme: any, message: string, onRetry: () => void }) => (
  <View style={[styles.overlay, { backgroundColor: theme.background }]}>
    <MaterialCommunityIcons name="alert-circle-outline" size={64} color={COLORS.status.unavailable} />
    <Text style={[styles.overlayText, { color: theme.text, textAlign: 'center' }]}>{message}</Text>
    <TouchableOpacity 
      style={[styles.retryButton, { backgroundColor: COLORS.accent.primary }]} 
      onPress={onRetry}
    >
      <MaterialCommunityIcons name="refresh" size={20} color="white" />
      <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
    </TouchableOpacity>
  </View>
);

// --- الأنماط المحسنة ---
const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  
  mapContainer: {
    flex: 1,
    borderRadius: SIZES.radiusLarge,
    margin: SIZES.base,
    overflow: 'hidden',
  },
  
  map: { 
    flex: 1 
  },
  
  // Header Styles
  header: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.medium,
    borderBottomWidth: 1,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  headerLeft: {
    width: 50,
  },
  
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  
  headerRight: {
    width: 50,
    alignItems: 'flex-end',
  },
  
  headerTitle: {
    ...FONTS.h3,
    fontWeight: 'bold',
    marginBottom: SIZES.small,
  },
  
  headerStats: {
    flexDirection: 'row',
    gap: SIZES.small,
  },
  
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.base,
    paddingVertical: 4,
    borderRadius: SIZES.radius,
    gap: 4,
  },
  
  quickStatNumber: {
    ...FONTS.button,
    fontWeight: 'bold',
  },
  
  quickStatLabel: {
    ...FONTS.caption,
  },
  
  statsButton: {
    padding: SIZES.base,
  },
  
  logoutButton: {
    padding: SIZES.base,
  },
  
  // Stats Panel
  statsPanel: {
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
    borderRadius: SIZES.radiusLarge,
    borderWidth: 1,
  },
  
  statsContent: {
    flexDirection: 'row',
    padding: SIZES.padding,
    alignItems: 'center',
  },

  markerUnavailable: {
  backgroundColor: COLORS.status.unavailable,
},

  
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: SIZES.small,
  },
  
  statNumber: {
    ...FONTS.h2,
    fontWeight: 'bold',
  },
  
  statLabel: {
    ...FONTS.caption,
    textAlign: 'center',
  },
  
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: SIZES.padding,
  },
  
  // Filter Controls
  filterContainer: {
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
  },
  
  filterControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radiusLarge,
    borderWidth: 1,
    gap: SIZES.small,
  },
  
  filterButtonText: {
    ...FONTS.button,
  },
  
  // Marker Styles
  markerWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    ...SHADOWS.dark.medium,
  },
  
  markerAvailable: {
    backgroundColor: COLORS.status.available,
  },
  
  markerSelected: {
    borderColor: COLORS.accent.primary,
    borderWidth: 4,
    shadowColor: COLORS.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  
  distanceBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.accent.primary,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  
  distanceText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Control Buttons
  controlButtonsContainer: {
    position: 'absolute',
    right: SIZES.padding,
    bottom: Platform.OS === 'ios' ? 120 : 100,
    gap: SIZES.base,
  },
  
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  
  // Bottom Sheet Styles
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * 0.7,
    borderTopLeftRadius: SIZES.radiusXLarge,
    borderTopRightRadius: SIZES.radiusXLarge,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.base,
    elevation: 16,
  },
  
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: SIZES.medium,
    position: 'relative',
  },
  
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: SIZES.base,
  },
  
  hospitalHeader: {
    alignItems: 'center',
    paddingBottom: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: SIZES.padding,
  },
  
  hospitalName: {
    ...FONTS.h2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SIZES.small,
  },
  
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.small,
  },
  
  distanceInfo: {
    ...FONTS.body,
  },
  
  // Status Section
  statusSection: {
    marginBottom: SIZES.padding,
  },
  
  sectionTitle: {
    ...FONTS.h3,
    fontWeight: '600',
    marginBottom: SIZES.medium,
  },
  
  statusCard: {
    flexDirection: 'row',
    padding: SIZES.padding,
    borderRadius: SIZES.radiusLarge,
    borderWidth: 2,
    alignItems: 'center',
    gap: SIZES.medium,
  },
  
  statusContent: {
    flex: 1,
  },
  
  statusTitle: {
    ...FONTS.h3,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  statusSubtitle: {
    ...FONTS.body,
    lineHeight: 20,
  },
  
  // Beds Section
  bedsSection: {
    marginBottom: SIZES.paddingLarge,
  },
  
  bedsGrid: {
    flexDirection: 'row',
    gap: SIZES.medium,
  },
  
  bedCard: {
    flex: 1,
    padding: SIZES.medium,
    borderRadius: SIZES.radiusLarge,
    borderWidth: 1,
    alignItems: 'center',
  },
  
  bedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.small,
    marginBottom: SIZES.small,
  },
  
  bedCardLabel: {
    ...FONTS.caption,
    fontWeight: '600',
  },
  
  bedCardContent: {
    alignItems: 'center',
    marginBottom: SIZES.small,
  },
  
  bedCardNumber: {
    ...FONTS.h1,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  
  bedCardTotal: {
    ...FONTS.caption,
  },
  
  bedProgressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginTop: SIZES.base,
  },
  
  bedProgress: {
    height: '100%',
    borderRadius: 2,
  },
  
  // Action Button
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.paddingLarge,
    borderRadius: SIZES.radiusLarge,
    gap: SIZES.medium,
    marginTop: SIZES.base,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  
  actionButtonText: {
    ...FONTS.h3,
    fontWeight: 'bold',
  },
  
  // Overlay Styles
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.paddingLarge,
  },
  
  overlayText: {
    ...FONTS.h3,
    marginTop: SIZES.padding,
    marginBottom: SIZES.paddingLarge,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.paddingLarge,
    borderRadius: SIZES.radiusLarge,
    gap: SIZES.small,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  
  retryButtonText: {
    color: 'white',
    ...FONTS.button,
    fontWeight: 'bold',
  },
  
  // Animation Styles
  fadeIn: {
    opacity: 1,
  },
  
  slideUp: {
    transform: [{ translateY: 0 }],
  },
  
  // Responsive Design
  tablet: {
    padding: SIZES.paddingLarge * 1.5,
  },
  
  // Additional Helper Styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Status Indicator Styles
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SIZES.small,
  },
  
  statusAvailable: {
    backgroundColor: COLORS.status.available,
  },
  
  statusUnavailable: {
    backgroundColor: COLORS.status.unavailable,
  },
  
  statusPending: {
    backgroundColor: '#FFA500',
  },
  
  // Card Styles
  card: {
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.padding,
    marginBottom: SIZES.medium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.medium,
  },
  
  cardTitle: {
    ...FONTS.h3,
    fontWeight: '600',
  },
  
  cardContent: {
    gap: SIZES.small,
  },
  
  // Badge Styles
  badge: {
    paddingHorizontal: SIZES.base,
    paddingVertical: 4,
    borderRadius: SIZES.radius,
    alignSelf: 'flex-start',
  },
  
  badgeText: {
    ...FONTS.caption,
    fontWeight: '600',
  },
  
  badgeSuccess: {
    backgroundColor: `${COLORS.status.available}20`,
  },
  
  badgeError: {
    backgroundColor: `${COLORS.status.unavailable}20`,
  },
  
  badgeWarning: {
    backgroundColor: '#FFA50020',
  },
  
  // Loading States
  skeleton: {
    borderRadius: SIZES.radius,
    backgroundColor: '#E0E0E0',
  },
  
  skeletonText: {
    height: 16,
    marginBottom: SIZES.base,
  },
  
  skeletonTitle: {
    height: 24,
    marginBottom: SIZES.medium,
  },
  
  // Accessibility
  accessibilityHidden: {
    opacity: 0,
    position: 'absolute',
    left: -10000,
  },
  
  // Platform specific styles
  ios: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  
  android: {
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
});