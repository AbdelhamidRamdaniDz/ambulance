import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { mockLogData } from '../../data/mock';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive breakpoints
const getDeviceType = () => {
  if (screenWidth < 768) return 'mobile';
  if (screenWidth < 1024) return 'tablet';
  return 'desktop';
};

const isSmallDevice = screenWidth < 360;
const isMediumDevice = screenWidth >= 360 && screenWidth < 768;
const isLargeDevice = screenWidth >= 768;

// Responsive values helpers for styles
const getResponsiveValue = (small: number, medium: number, large: number) => {
  if (isSmallDevice) return small;
  if (isMediumDevice) return medium;
  return large;
};

const responsivePadding = getResponsiveValue(SIZES.padding * 0.8, SIZES.padding, SIZES.padding * 1.2);

export default function PatientDetailScreen() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme || 'light'];
  const shadows = SHADOWS[colorScheme || 'light'];
  const router = useRouter();
  
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const deviceType = getDeviceType();

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const patient = mockLogData.find((p) => p.id === logId);

  // Responsive values
  // (getResponsiveValue and responsivePadding are now defined outside for use in styles)
  const responsiveFontSize = {
    h1: getResponsiveValue(SIZES.h1 - 6, SIZES.h1 - 2, SIZES.h1),
    h3: getResponsiveValue(SIZES.h3 - 2, SIZES.h3, SIZES.h3 + 2),
    body: getResponsiveValue(SIZES.body - 1, SIZES.body, SIZES.body + 1),
  };

  if (!patient) {
    return (
      <SafeAreaView style={[styles.containerCenter, { backgroundColor: theme.background }]}>
        <View style={[styles.notFoundContainer, { backgroundColor: theme.card }, shadows.medium]}>
          <MaterialCommunityIcons name="account-search" size={80} color={theme.textSecondary} />
          <Text style={[FONTS.h2, { color: theme.text, marginTop: SIZES.padding, textAlign: 'center' }]}>
            لم يتم العثور على المريض
          </Text>
          <Text style={[FONTS.body, { color: theme.textSecondary, marginTop: SIZES.base, textAlign: 'center' }]}>
            يبدو أن المريض المطلوب غير موجود في السجلات
          </Text>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backButton, { backgroundColor: COLORS.roles.paramedic }, shadows.small]}
          >
            <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
            <Text style={styles.backButtonText}>الرجوع</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderDetailRow = (label: string, value: string, icon?: keyof typeof MaterialCommunityIcons.glyphMap) => (
    <View style={[styles.detailRow, { borderBottomColor: theme.borderLight }]}>
      <View style={styles.detailContent}>
        <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
        <View style={styles.labelContainer}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: COLORS.roles.paramedicLight }]}>
              <MaterialCommunityIcons name={icon} size={16} color={COLORS.roles.paramedic} />
            </View>
          )}
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}</Text>
        </View>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    return status === 'completed' ? COLORS.status.available : COLORS.status.limited;
  };

  const getStatusText = (status: string) => {
    return status === 'completed' ? 'تمت المعالجة' : 'قيد المعالجة';
  };

  const getStatusIcon = (status: string) => {
    return status === 'completed' ? "check-circle" : "clock-outline";
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: `ملف المريض`,
          headerStyle: { backgroundColor: theme.card },
          headerTitleStyle: { color: theme.text, ...FONTS.title },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCardContainer}>
          <View
            style={[styles.headerCard, { backgroundColor: getStatusColor(patient.status) }, shadows.large]}
          >
            <View style={styles.headerContent}>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{patient.patientName}</Text>
                <View style={styles.statusContainer}>
                  <MaterialCommunityIcons 
                    name={getStatusIcon(patient.status)}
                    size={18} 
                    color="white" 
                  />
                  <Text style={styles.statusText}>{getStatusText(patient.status)}</Text>
                </View>
                <Text style={styles.patientId}>#{patient.id}</Text>
              </View>
              <View style={styles.patientAvatar}>
                <MaterialCommunityIcons name="account" size={36} color="white" />
              </View>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.quickStatsContainer,
            { marginTop: 16 },
            deviceType === 'tablet' && styles.quickStatsTablet,
            deviceType === 'desktop' && styles.quickStatsDesktop
          ]}
        >
          <View style={[styles.quickStatCard, { backgroundColor: theme.card }, shadows.medium]}>
            <View style={[
              styles.quickStatIcon, 
              { backgroundColor: '#FFE5E5' },
              isSmallDevice && styles.quickStatIconSmall
            ]}>
              <MaterialCommunityIcons 
                name="water-opacity" 
                size={getResponsiveValue(20, 24, 28)} 
                color="#E74C3C" 
              />
            </View>
            <Text style={[
              styles.quickStatValue, 
              { color: theme.text, fontSize: responsiveFontSize.h3 }
            ]}>
              {patient.bloodType}
            </Text>
            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>زمرة الدم</Text>
          </View>
          <View style={[styles.quickStatCard, { backgroundColor: theme.card }, shadows.medium]}>
            <View style={[
              styles.quickStatIcon, 
              { backgroundColor: '#E3F2FD' },
              isSmallDevice && styles.quickStatIconSmall
            ]}>
              <MaterialCommunityIcons 
                name="hospital-building" 
                size={getResponsiveValue(20, 24, 28)} 
                color="#3498DB" 
              />
            </View>
            <Text style={[
              styles.quickStatValue, 
              { color: theme.text, fontSize: responsiveFontSize.body }
            ]} numberOfLines={isSmallDevice ? 3 : 2}>
              {patient.assignedHospital}
            </Text>
            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>المستشفى</Text>
          </View>
        </View>

        {/* Medical Information with Enhanced Cards */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card }, shadows.medium]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: COLORS.roles.paramedicLight }]}>
              <MaterialCommunityIcons name="clipboard-pulse" size={24} color={COLORS.roles.paramedic} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>المعلومات الطبية</Text>
          </View>
          {renderDetailRow("الحالة الأولية", patient.condition, "clipboard-pulse-outline")}
          {renderDetailRow("زمرة الدم", patient.bloodType, "water-opacity")}
        </View>

        {/* Timeline Information */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card }, shadows.medium]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: COLORS.accent.info + '20' }]}>
              <MaterialCommunityIcons name="timeline-outline" size={24} color={COLORS.accent.info} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>الجدول الزمني</Text>
          </View>
          {renderDetailRow("تاريخ الدخول", patient.entryDate, "login-variant")}
          {renderDetailRow("تاريخ الخروج", patient.dischargeDate, "logout-variant")}
          {renderDetailRow("المستشفى المحول إليه", patient.assignedHospital, "hospital-building")}
        </View>

        {/* Medical Report with Enhanced Design */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card }, shadows.medium]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: COLORS.accent.success + '20' }]}>
              <MaterialCommunityIcons name="file-document-outline" size={24} color={COLORS.accent.success} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>التقرير الطبي</Text>
          </View>
          <View style={[styles.notesContainer, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={[styles.detailedNotes, { color: theme.text }]}>{patient.detailedNotes}</Text>
          </View>
        </View>

        {/* Enhanced Action Buttons with Responsive Layout */}
        <View style={[
          styles.actionButtonsContainer,
          deviceType === 'tablet' && styles.actionButtonsTablet,
          isSmallDevice && styles.actionButtonsSmall
        ]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton, shadows.medium]}
            onPress={() => {
              // Simple print: open print dialog with report text
              if (typeof window !== 'undefined' && window.print) {
                window.print();
              } else {
                // For native: show alert as placeholder
                alert('ميزة الطباعة غير متوفرة حالياً على هذا الجهاز.');
              }
            }}
          >
            <MaterialCommunityIcons 
              name="printer" 
              size={getResponsiveValue(18, 20, 22)} 
              color="white" 
            />
            <Text style={[
              styles.actionButtonText,
              { fontSize: getResponsiveValue(SIZES.bodySmall, SIZES.body, SIZES.body) }
            ]}>
              طباعة التقرير
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton, shadows.medium]}
            onPress={async () => {
              // Try to use native share if available, otherwise fallback
              try {
                const reportText = patient?.detailedNotes
                  ? `تقرير المريض: ${patient.detailedNotes}`
                  : 'لا يوجد تقرير متاح.';
                if ('share' in navigator) {
                  // Web Share API
                  await navigator.share({
                    title: 'تقرير المريض',
                    text: reportText,
                  });
                } else {
                  // Fallback: copy to clipboard
                  // Use type assertion to avoid TS error about navigator.clipboard
                  if (
                    typeof navigator !== 'undefined' &&
                    typeof (navigator as any).clipboard !== 'undefined'
                  ) {
                    await (navigator as any).clipboard.writeText(reportText);
                    alert('تم نسخ التقرير إلى الحافظة!');
                  } else {
                    alert(reportText);
                  }
                }
              } catch (e) {
                alert('تعذر مشاركة التقرير.');
              }
            }}
          >
            <MaterialCommunityIcons 
              name="share-variant" 
              size={getResponsiveValue(18, 20, 22)} 
              color="white" 
            />
            <Text style={[
              styles.actionButtonText,
              { fontSize: getResponsiveValue(SIZES.bodySmall, SIZES.body, SIZES.body) }
            ]}>
              مشاركة
            </Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Contact Button with Responsive Size */}
        <TouchableOpacity
          style={[
            styles.emergencyButton, 
            { backgroundColor: COLORS.accent.error }, 
            shadows.large,
            isSmallDevice && styles.emergencyButtonSmall
          ]}
          onPress={() => {
            // Try to call emergency number
            const emergencyNumber = '112';
            if (typeof window !== 'undefined') {
              // Web: try to open tel: link
              window.open(`tel:${emergencyNumber}`);
            } else {
              // React Native: use Linking API
              try {
                // @ts-ignore
                import('react-native').then(({ Linking }) => {
                  Linking.openURL(`tel:${emergencyNumber}`);
                });
              } catch (e) {
                alert(`يرجى الاتصال على ${emergencyNumber}`);
              }
            }
          }}
        >
          <MaterialCommunityIcons 
            name="phone-outline" 
            size={getResponsiveValue(20, 24, 28)} 
            color="white" 
          />
          <Text style={[
            styles.emergencyButtonText,
            { fontSize: getResponsiveValue(SIZES.body, SIZES.title, SIZES.title + 2) }
          ]}>
            اتصال طارئ
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1 
  },
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  notFoundContainer: {
    padding: SIZES.padding * 2,
    borderRadius: SIZES.radiusLarge,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  scrollContainer: { 
    paddingBottom: 30 
  },
  
  // Enhanced Header Card Styles with Responsive Design
  headerCardContainer: {
    padding: responsivePadding,
    paddingBottom: 0,
  },
  headerCard: {
    borderRadius: SIZES.radiusLarge,
    padding: getResponsiveValue(SIZES.padding * 1.2, SIZES.padding * 1.8, SIZES.padding * 2),
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  patientInfo: {
    flex: 1,
    paddingRight: SIZES.padding,
  },
  patientName: {
    ...FONTS.h1,
    color: 'white',
    fontWeight: '700',
    marginBottom: SIZES.base,
    textAlign: 'right',
    fontSize: isSmallDevice ? SIZES.h2 : isLargeDevice ? SIZES.h1 : SIZES.h1 - 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: SIZES.base,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: isSmallDevice ? SIZES.padding * 0.8 : SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radiusLarge,
  },
  statusText: {
    ...FONTS.body,
    color: 'white',
    fontWeight: '600',
    marginRight: SIZES.base,
    fontSize: isSmallDevice ? SIZES.bodySmall : SIZES.body,
  },
  patientId: {
    ...FONTS.caption,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    textAlign: 'right',
  },
  patientAvatar: {
    width: isSmallDevice ? 60 : isLargeDevice ? 80 : 70,
    height: isSmallDevice ? 60 : isLargeDevice ? 80 : 70,
    borderRadius: isSmallDevice ? 30 : isLargeDevice ? 40 : 35,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  // Enhanced Quick Stats Styles with Responsive Design
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginTop: -30,
    marginBottom: SIZES.padding,
    gap: isSmallDevice ? SIZES.padding * 0.8 : SIZES.padding,
  },
  quickStatsTablet: {
    paddingHorizontal: SIZES.padding * 1.5,
    gap: SIZES.padding * 1.5,
  },
  quickStatsDesktop: {
    paddingHorizontal: SIZES.padding * 2,
    gap: SIZES.padding * 2,
    maxWidth: 800,
    alignSelf: 'center',
  },
  quickStatCard: {
    flex: 1,
    padding: isSmallDevice ? SIZES.padding : isLargeDevice ? SIZES.padding * 2 : SIZES.padding * 1.5,
    borderRadius: SIZES.radiusLarge,
    alignItems: 'center',
    minHeight: isSmallDevice ? 120 : isLargeDevice ? 160 : 140,
    justifyContent: 'center',
  },
  quickStatIcon: {
    width: isSmallDevice ? 40 : isLargeDevice ? 60 : 50,
    height: isSmallDevice ? 40 : isLargeDevice ? 60 : 50,
    borderRadius: isSmallDevice ? 20 : isLargeDevice ? 30 : 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.padding,
  },
  quickStatIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  quickStatValue: {
    ...FONTS.h3,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SIZES.base / 2,
  },
  quickStatLabel: {
    ...FONTS.caption,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: isSmallDevice ? SIZES.caption - 1 : SIZES.caption,
  },

  // Enhanced Section Card Styles with Responsive Design
  sectionCard: {
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radiusLarge,
    padding: isSmallDevice ? SIZES.padding : isLargeDevice ? SIZES.padding * 2 : SIZES.padding * 1.5,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: SIZES.padding * 1.2,
    paddingBottom: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sectionIconContainer: {
    width: isSmallDevice ? 35 : isLargeDevice ? 45 : 40,
    height: isSmallDevice ? 35 : isLargeDevice ? 45 : 40,
    borderRadius: isSmallDevice ? 17.5 : isLargeDevice ? 22.5 : 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h3,
    fontWeight: '700',
    fontSize: isSmallDevice ? SIZES.h4 : isLargeDevice ? SIZES.h2 : SIZES.h3,
  },

  // Enhanced Detail Row Styles with Responsive Design
  detailRow: {
    paddingVertical: isSmallDevice ? SIZES.padding : SIZES.padding * 1.2,
    borderBottomWidth: 1,
  },
  detailContent: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  labelContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: SIZES.base,
  },
  iconContainer: {
    width: isSmallDevice ? 28 : isLargeDevice ? 36 : 32,
    height: isSmallDevice ? 28 : isLargeDevice ? 36 : 32,
    borderRadius: isSmallDevice ? 14 : isLargeDevice ? 18 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.padding,
  },
  detailLabel: {
    ...FONTS.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: isSmallDevice ? SIZES.caption - 1 : SIZES.caption,
  },
  detailValue: {
    ...FONTS.body,
    fontSize: isSmallDevice ? SIZES.body - 1 : isLargeDevice ? SIZES.body + 2 : 17,
    fontWeight: '600',
    textAlign: 'right',
    lineHeight: 24,
  },

  // Enhanced Notes Styles with Responsive Design
  notesContainer: {
    padding: isSmallDevice ? SIZES.padding : isLargeDevice ? SIZES.padding * 2 : SIZES.padding * 1.5,
    borderRadius: SIZES.radius,
    marginTop: SIZES.base,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent.success,
  },
  detailedNotes: {
    ...FONTS.body,
    lineHeight: 26,
    textAlign: 'right',
    fontSize: isSmallDevice ? SIZES.bodySmall : isLargeDevice ? SIZES.body + 1 : SIZES.body,
  },

  // Enhanced Action Buttons with Responsive Design
  actionButtonsContainer: {
    flexDirection: isSmallDevice ? 'column' : 'row',
    paddingHorizontal: SIZES.padding,
    gap: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  actionButtonsTablet: {
    paddingHorizontal: SIZES.padding * 2,
    maxWidth: 600,
    alignSelf: 'center',
  },
  actionButtonsSmall: {
    gap: SIZES.padding * 0.8,
  },
  actionButton: {
    flex: isSmallDevice ? 0 : 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isSmallDevice ? SIZES.padding : isLargeDevice ? SIZES.padding * 1.5 : SIZES.padding * 1.2,
    borderRadius: SIZES.radiusLarge,
    minHeight: isSmallDevice ? 50 : 55,
  },
  primaryButton: {
    backgroundColor: COLORS.roles.paramedic,
  },
  secondaryButton: {
    backgroundColor: COLORS.accent.secondary,
  },
  actionButtonText: {
    ...FONTS.body,
    color: 'white',
    fontWeight: '600',
    marginRight: SIZES.base,
  },

  // Emergency Button with Responsive Design
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SIZES.padding,
    padding: isSmallDevice ? SIZES.padding : isLargeDevice ? SIZES.padding * 2 : SIZES.padding * 1.5,
    borderRadius: SIZES.radiusLarge,
    marginBottom: SIZES.padding,
    minHeight: isSmallDevice ? 55 : isLargeDevice ? 70 : 60,
  },
  emergencyButtonSmall: {
    marginHorizontal: SIZES.padding,
    padding: SIZES.padding,
  },
  emergencyButtonText: {
    ...FONTS.title,
    color: 'white',
    fontWeight: '700',
    marginRight: SIZES.padding,
  },

  // Enhanced Back Button with Responsive Design
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? SIZES.padding * 1.5 : SIZES.padding * 2,
    paddingVertical: isSmallDevice ? SIZES.padding : SIZES.padding * 1.2,
    borderRadius: SIZES.radiusLarge,
    marginTop: SIZES.padding * 2,
  },
  backButtonText: {
    ...FONTS.body,
    color: 'white',
    fontWeight: '600',
    marginRight: SIZES.base,
    fontSize: isSmallDevice ? SIZES.bodySmall : SIZES.body,
  },
});