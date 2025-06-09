import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { Stack } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { mapStyleDark, mapStyleLight } from '../../constants/mapStyles';

const hospitalLocation = { latitude: 34.673, longitude: 3.263, name: "مستشفى الجلفة المركزي" };
const nearbyAmbulances = [
  { id: 'amb1', lat: 34.678, lng: 3.265, case: 'حالة حرجة' },
  { id: 'amb2', lat: 34.669, lng: 3.250, case: 'نقل عادي' },
];

export default function NearbyAmbulancesScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const theme = COLORS[colorScheme || 'light'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'سيارات الإسعاف القريبة',
          headerStyle: { backgroundColor: theme.card },
          headerTitleStyle: { color: theme.text, ...FONTS.title },
        }}
      />
      <MapView
        style={styles.map}
        customMapStyle={isDarkMode ? mapStyleDark : mapStyleLight}
        initialRegion={{
          latitude: hospitalLocation.latitude,
          longitude: hospitalLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* مؤشر المستشفى */}
        <Marker coordinate={hospitalLocation} title={hospitalLocation.name}>
          <View style={styles.hospitalMarker}>
            <MaterialCommunityIcons name="hospital-building" size={32} color="white" />
          </View>
        </Marker>

        {/* مؤشرات سيارات الإسعاف */}
        {nearbyAmbulances.map(ambulance => (
          <Marker
            key={ambulance.id}
            coordinate={{ latitude: ambulance.lat, longitude: ambulance.lng }}
            title={`سيارة إسعاف`}
            description={ambulance.case}
          >
            <View style={styles.ambulanceMarker}>
                <MaterialCommunityIcons name="ambulance" size={24} color="white" />
            </View>
          </Marker>
        ))}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  map: { flex: 1 },
  hospitalMarker: {
    padding: SIZES.base,
    backgroundColor: COLORS.roles.hospital,
    borderRadius: SIZES.radius * 2,
    elevation: 5,
  },
  ambulanceMarker: {
    padding: SIZES.base,
    backgroundColor: COLORS.roles.paramedic,
    borderRadius: SIZES.radius,
    elevation: 5,
  },
});
