import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
  Pressable,
  Linking,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { mockLogData } from '../../data/mock';

const { width: screenWidth } = Dimensions.get('window');

const getDeviceType = () => {
  if (screenWidth < 768) return 'mobile';
  if (screenWidth < 1024) return 'tablet';
  return 'desktop';
};

const isSmallDevice = screenWidth < 360;
const isMediumDevice = screenWidth >= 360 && screenWidth < 768;

const getResponsiveValue = (small: number, medium: number, large: number) => {
  if (isSmallDevice) return small;
  if (isMediumDevice) return medium;
  return large;
};

const responsivePadding = getResponsiveValue(SIZES.padding * 0.8, SIZES.padding, SIZES.padding * 1.2);

function generatePatientReportHTML(patient: any) {
  return `
    <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8" />
        <title>تقرير المريض</title>
        <style>
          body { font-family: Tahoma, Arial, sans-serif; background: #f8f8f8; color: #222; padding: 32px; }
          .header { background: #${COLORS.roles.paramedic.replace('#','')}; color: #fff; border-radius: 16px; padding: 24px 32px; margin-bottom: 32px; }
          .header h1 { margin: 0 0 8px 0; font-size: 2em; }
          .header .status { font-size: 1.1em; margin-bottom: 4px; }
          .section { background: #fff; border-radius: 12px; margin-bottom: 24px; padding: 20px 28px; box-shadow: 0 2px 8px #0001; }
          .section h2 { margin-top: 0; font-size: 1.2em; color: #${COLORS.roles.paramedic.replace('#','')}; }
          .row { margin-bottom: 10px; }
          .label { color: #888; font-weight: bold; min-width: 120px; display: inline-block; }
          .value { color: #222; }
          .notes { background: #f3f9f3; border-right: 4px solid #${COLORS.accent.success.replace('#','')}; padding: 16px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${patient.patientName}</h1>
          <div class="status">${patient.status === 'completed' ? 'تمت المعالجة' : 'قيد المعالجة'}</div>
          <div class="id">#${patient.id}</div>
        </div>
        <div class="section">
          <h2>المعلومات الطبية</h2>
          <div class="row"><span class="label">الحالة الأولية:</span> <span class="value">${patient.condition}</span></div>
          <div class="row"><span class="label">زمرة الدم:</span> <span class="value">${patient.bloodType}</span></div>
        </div>
        <div class="section">
          <h2>الجدول الزمني</h2>
          <div class="row"><span class="label">تاريخ الدخول:</span> <span class="value">${patient.entryDate}</span></div>
          <div class="row"><span class="label">تاريخ الخروج:</span> <span class="value">${patient.dischargeDate}</span></div>
          <div class="row"><span class="label">المستشفى المحول إليه:</span> <span class="value">${patient.assignedHospital}</span></div>
        </div>
        <div class="section">
          <h2>التقرير الطبي</h2>
          <div class="notes">${patient.detailedNotes || ''}</div>
        </div>
      </body>
    </html>
  `;
}

function printPatientReport(patient: any) {
  // Only attempt to use window.open if it exists (i.e., on web)
  if (typeof window !== 'undefined' && typeof window.open === 'function') {
    const html = generatePatientReportHTML(patient);
    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      alert('تعذر فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.');
    }
  } else {
    alert('ميزة الطباعة غير متوفرة حالياً على هذا الجهاز.');
  }
}

function downloadPatientPDF(patient: any) {
  printPatientReport(patient);
}

export default function PatientDetailScreen() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme || 'light'];
  const router = useRouter();
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const deviceType = getDeviceType();
  const headerAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
      easing: (t) => t * t * (3 - 2 * t),
    }).start();
    return () => subscription?.remove();
  }, []);

  const patient = mockLogData.find((p) => p.id === logId);

  const responsiveFontSize = {
    h1: getResponsiveValue(SIZES.h1 - 6, SIZES.h1 - 2, SIZES.h1),
    h3: getResponsiveValue(SIZES.h3 - 2, SIZES.h3, SIZES.h3 + 2),
    body: getResponsiveValue(SIZES.body - 1, SIZES.body, SIZES.body + 1),
  };

  if (!patient) {
    return (
      <SafeAreaView style={[styles.containerCenter, { backgroundColor: theme.background }]}>
        <View style={[styles.notFoundContainer, { backgroundColor: theme.card }]}>
          <MaterialCommunityIcons name="account-search" size={80} color={theme.textSecondary} />
          <Text style={[FONTS.h2, { color: theme.text, marginTop: SIZES.padding, textAlign: 'center' }]}>
            لم يتم العثور على المريض
          </Text>
          <Text style={[FONTS.body, { color: theme.textSecondary, marginTop: SIZES.base, textAlign: 'center' }]}>
            يبدو أن المريض المطلوب غير موجود في السجلات
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: COLORS.roles.paramedic, opacity: pressed ? 0.8 : 1 },
            ]}
            android_ripple={{ color: COLORS.roles.paramedicLight }}
          >
            <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
            <Text style={styles.backButtonText}>الرجوع</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    return status === 'completed' ? COLORS.status.available : COLORS.status.limited;
  };

  const getStatusText = (status: string) => {
    return status === 'completed' ? 'تمت المعالجة' : 'قيد المعالجة';
  };

  const getStatusIcon = (status: string) => {
    return status === 'completed' ? "check-circle" : "clock-outline";
  };

  const handleEmergencyCall = () => {
    const emergencyNumber = '112';
    Linking.openURL(`tel:${emergencyNumber}`).catch(() => {
      alert(`يرجى الاتصال على ${emergencyNumber}`);
    });
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
        <Animated.View
          style={[
            styles.headerCardContainer,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.headerCard,
              { backgroundColor: getStatusColor(patient.status) },
            ]}
          >
            <View style={styles.headerContent}>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{patient.patientName}</Text>
                <View style={styles.statusContainer}>
                  <Text style={styles.statusText}>{getStatusText(patient.status)}</Text>
                  <MaterialCommunityIcons
                    name={getStatusIcon(patient.status)}
                    size={18}
                    color="white"
                  />
                </View>
                <Text style={styles.patientId}>#{patient.id}</Text>
              </View>
              <Animated.View
                style={{
                  ...styles.patientAvatar,
                  transform: [
                    {
                      scale: headerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                  shadowOpacity: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.1, 0.25],
                  }),
                }}
              >
                <MaterialCommunityIcons name="account" size={36} color="white" />
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        <View
          style={[
            styles.quickStatsContainer,
            { marginTop: 16 },
            deviceType === 'tablet' && styles.quickStatsTablet,
            deviceType === 'desktop' && styles.quickStatsDesktop,
          ]}
        >
          <Animated.View
            style={{
              ...styles.quickStatCard,
              backgroundColor: theme.card,
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            }}
          >
            <View
              style={[
                styles.quickStatIcon,
                { backgroundColor: '#FFE5E5' },
              ]}
            >
              <MaterialCommunityIcons
                name="water-opacity"
                size={getResponsiveValue(20, 24, 28)}
                color="#E74C3C"
              />
            </View>
            <Text
              style={[
                styles.quickStatValue,
                { color: theme.text, fontSize: responsiveFontSize.h3 },
              ]}
            >
              {patient.bloodType}
            </Text>
            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>زمرة الدم</Text>
          </Animated.View>
          <Animated.View
            style={{
              ...styles.quickStatCard,
              backgroundColor: theme.card,
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            }}
          >
            <View
              style={[
                styles.quickStatIcon,
                { backgroundColor: '#E3F2FD' },
              ]}
            >
              <MaterialCommunityIcons
                name="hospital-building"
                size={getResponsiveValue(20, 24, 28)}
                color="#3498DB"
              />
            </View>
            <Text
              style={[
                styles.quickStatValue,
                { color: theme.text, fontSize: responsiveFontSize.body },
              ]}
              numberOfLines={isSmallDevice ? 3 : 2}
            >
              {patient.assignedHospital}
            </Text>
            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>المستشفى</Text>
          </Animated.View>
        </View>

        <Animated.View
          style={{
            ...styles.sectionCard,
            backgroundColor: theme.card,
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: COLORS.roles.paramedicLight }]}>
              <MaterialCommunityIcons name="clipboard-pulse" size={24} color={COLORS.roles.paramedic} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>المعلومات الطبية</Text>
          </View>
          <View style={styles.medicalInfoContainer}>
            <View style={styles.medicalInfoRow}>
              <View style={styles.medicalInfoIconContainer}>
                <MaterialCommunityIcons name="clipboard-pulse-outline" size={20} color={COLORS.roles.paramedic} />
              </View>
              <View style={styles.medicalInfoContent}>
                <Text style={[styles.medicalInfoLabel, { color: theme.textSecondary }]}>الحالة الأولية</Text>
                <Text style={[styles.medicalInfoValue, { color: theme.text }]}>{patient.condition}</Text>
              </View>
            </View>
            <View style={styles.medicalInfoDivider} />
            <View style={styles.medicalInfoRow}>
              <View style={styles.medicalInfoIconContainer}>
                <MaterialCommunityIcons name="water-opacity" size={20} color={COLORS.roles.paramedic} />
              </View>
              <View style={styles.medicalInfoContent}>
                <Text style={[styles.medicalInfoLabel, { color: theme.textSecondary }]}>زمرة الدم</Text>
                <Text style={[styles.medicalInfoValue, { color: theme.text }]}>{patient.bloodType}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={{
            ...styles.sectionCard,
            backgroundColor: theme.card,
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          }}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: COLORS.accent.info + '20' }]}>
              <MaterialCommunityIcons name="timeline-outline" size={24} color={COLORS.accent.info} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>الجدول الزمني</Text>
          </View>
          {/* تصميم مخصص لصف "تاريخ الدخول" مع gap بين الأيقونة والتاريخ */}
          <View
            style={{
              flexDirection: 'row-reverse',
              alignItems: 'center',
              paddingVertical: getResponsiveValue(SIZES.padding, SIZES.padding * 1.2, SIZES.padding * 1.5),
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(0,0,0,0.05)',
              gap: 14,
            }}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.accent.info + '30' }]}>
              <MaterialCommunityIcons name="login-variant" size={22} color={COLORS.accent.info} />
            </View>
            <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>تاريخ الدخول</Text>
              <Text style={[styles.medicalInfoValue, { color: theme.text }]}>{patient.entryDate}</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row-reverse',
              alignItems: 'center',
              paddingVertical: getResponsiveValue(SIZES.padding, SIZES.padding * 1.2, SIZES.padding * 1.5),
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(0,0,0,0.05)',
              gap: 14,
            }}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.accent.info + '30' }]}>
              <MaterialCommunityIcons name="logout-variant" size={22} color={COLORS.accent.info} />
            </View>
            <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>تاريخ الخروج</Text>
              <Text style={[styles.medicalInfoValue, { color: theme.text }]}>{patient.dischargeDate}</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row-reverse',
              alignItems: 'center',
              paddingVertical: getResponsiveValue(SIZES.padding, SIZES.padding * 1.2, SIZES.padding * 1.5),
              gap: 14,
            }}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.accent.info + '30' }]}>
              <MaterialCommunityIcons name="hospital-building" size={22} color={COLORS.accent.info} />
            </View>
            <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>المستشفى المحول إليه</Text>
              <Text style={[styles.medicalInfoValue, { color: theme.text }]}>{patient.assignedHospital}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={{
            ...styles.sectionCard,
            backgroundColor: theme.card,
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [5, 0],
                }),
              },
            ],
          }}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: COLORS.accent.success + '20' }]}>
              <MaterialCommunityIcons name="file-document-outline" size={24} color={COLORS.accent.success} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>التقرير الطبي</Text>
          </View>
          <View style={styles.notesContainer}>
            <Text style={[styles.detailedNotes, { color: theme.text }]}>{patient.detailedNotes}</Text>
          </View>
        </Animated.View>

        <View
          style={[
            styles.actionButtonsContainer,
            deviceType === 'tablet' && styles.actionButtonsTablet,
            isSmallDevice && styles.actionButtonsSmall,
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.primaryButton,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            android_ripple={{ color: COLORS.roles.paramedicLight }}
            onPress={() => {
              printPatientReport(patient);
            }}
          >
            <Text
              style={[
                styles.actionButtonText,
                { fontSize: getResponsiveValue(SIZES.bodySmall, SIZES.body, SIZES.body) },
              ]}
            >
              طباعة
            </Text>
              <MaterialCommunityIcons
                name="printer"
                size={getResponsiveValue(18, 20, 22)}
                color="white"
              />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.secondaryButton,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            android_ripple={{ color: COLORS.accent.secondary + '55' }}
            onPress={async () => {
              try {
                const reportText = patient?.detailedNotes
                  ? `تقرير المريض: ${patient.detailedNotes}`
                  : 'لا يوجد تقرير متاح.';
                if (typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function') {
                  await (navigator as any).share({
                    title: 'تقرير المريض',
                    text: reportText,
                  });
                } else if (
                  typeof navigator !== 'undefined' &&
                  typeof (navigator as any).clipboard !== 'undefined'
                ) {
                  await (navigator as any).clipboard.writeText(reportText);
                  alert('تم نسخ التقرير إلى الحافظة!');
                } else {
                  alert(reportText);
                }
              } catch (e) {
                alert('تعذر مشاركة التقرير.');
              }
            }}
          >
            <Text
              style={[
                styles.actionButtonText,
                { fontSize: getResponsiveValue(SIZES.bodySmall, SIZES.body, SIZES.body) },
              ]}
            >
              مشاركة
            </Text>
              <MaterialCommunityIcons
                name="share-variant"
                size={getResponsiveValue(18, 20, 22)}
                color="white"
              />
          </Pressable>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.emergencyButton,
            { backgroundColor: COLORS.accent.error, opacity: pressed ? 0.9 : 1 },
            isSmallDevice && styles.emergencyButtonSmall,
          ]}
          android_ripple={{ color: COLORS.accent.error + '33' }}
          onPress={handleEmergencyCall}
        >
          <Text
            style={[
              styles.emergencyButtonText,
              { fontSize: getResponsiveValue(SIZES.body, SIZES.title, SIZES.title + 2) },
            ]}
          >
            اتصال طارئ
          </Text>
            <MaterialCommunityIcons
              name="phone-outline"
              size={getResponsiveValue(20, 24, 28)}
              color="white"
            />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    ...SHADOWS.light.large,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  headerCardContainer: {
    padding: responsivePadding,
    paddingBottom: 0,
  },
  headerCard: {
    borderRadius: SIZES.radiusLarge,
    padding: getResponsiveValue(SIZES.padding * 1.2, SIZES.padding * 1.8, SIZES.padding * 2),
    overflow: 'hidden',
    ...SHADOWS.light.large,
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
    fontSize: getResponsiveValue(SIZES.h2, SIZES.h1 - 2, SIZES.h1),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: SIZES.base,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: getResponsiveValue(SIZES.padding * 0.8, SIZES.padding, SIZES.padding * 1.2),
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radiusLarge,
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(10px)' }
      : {}),
  },
  statusText: {
    ...FONTS.body,
    color: 'white',
    fontWeight: '600',
    marginRight: SIZES.base,
    fontSize: getResponsiveValue(SIZES.bodySmall, SIZES.body, SIZES.body + 1),
  },
  patientId: {
    ...FONTS.caption,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    textAlign: 'right',
  },
  patientAvatar: {
    width: getResponsiveValue(60, 70, 80),
    height: getResponsiveValue(60, 70, 80),
    borderRadius: getResponsiveValue(30, 35, 40),
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    ...SHADOWS.light.medium,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginTop: -30,
    marginBottom: SIZES.padding,
    gap: getResponsiveValue(SIZES.padding * 0.8, SIZES.padding, SIZES.padding * 1.5),
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
    padding: getResponsiveValue(SIZES.padding, SIZES.padding * 1.5, SIZES.padding * 2),
    borderRadius: SIZES.radiusLarge,
    alignItems: 'center',
    minHeight: getResponsiveValue(120, 140, 160),
    justifyContent: 'center',
    ...SHADOWS.light.medium,
  },
  quickStatIcon: {
    width: getResponsiveValue(40, 50, 60),
    height: getResponsiveValue(40, 50, 60),
    borderRadius: getResponsiveValue(20, 25, 30),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.padding,
    ...SHADOWS.light.small,
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
    fontSize: getResponsiveValue(SIZES.caption - 1, SIZES.caption, SIZES.caption + 1),
  },
  sectionCard: {
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radiusLarge,
    padding: getResponsiveValue(SIZES.padding, SIZES.padding * 1.5, SIZES.padding * 2),
    ...SHADOWS.light.medium,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: SIZES.padding * 1.2,
    gap: 10,
    paddingBottom: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sectionIconContainer: {
    width: getResponsiveValue(35, 40, 45),
    height: getResponsiveValue(35, 40, 45),
    borderRadius: getResponsiveValue(17.5, 20, 22.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.padding,
    ...SHADOWS.light.small,
  },
  sectionTitle: {
    ...FONTS.h3,
    fontWeight: '700',
    fontSize: getResponsiveValue(SIZES.h4, SIZES.h3, SIZES.h2),
  },
  detailRow: {
    paddingVertical: getResponsiveValue(SIZES.padding, SIZES.padding * 1.2, SIZES.padding * 1.5),
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
    width: getResponsiveValue(28, 32, 36),
    height: getResponsiveValue(28, 32, 36),
    borderRadius: getResponsiveValue(14, 16, 18),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.padding,
    ...SHADOWS.light.small,
  },
  detailLabel: {
    ...FONTS.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: getResponsiveValue(SIZES.caption - 1, SIZES.caption, SIZES.caption + 1),
  },
  detailValue: {
    ...FONTS.body,
    fontSize: getResponsiveValue(SIZES.body - 1, SIZES.body, SIZES.body + 2),
    fontWeight: '600',
    textAlign: 'right',
    lineHeight: 24,
  },
  notesContainer: {
    padding: getResponsiveValue(SIZES.padding, SIZES.padding * 1.5, SIZES.padding * 2),
    borderRadius: SIZES.radius,
    marginTop: SIZES.base,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent.success,
    backgroundColor: 'rgba(0,0,0,0.02)',
    ...SHADOWS.light.small,
  },
  detailedNotes: {
    ...FONTS.body,
    lineHeight: 26,
    textAlign: 'right',
    fontSize: getResponsiveValue(SIZES.bodySmall, SIZES.body, SIZES.body + 1),
  },
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
    padding: getResponsiveValue(SIZES.padding, SIZES.padding * 1.2, SIZES.padding * 1.5),
    borderRadius: SIZES.radiusLarge,
    minHeight: getResponsiveValue(50, 55, 60),
    ...SHADOWS.light.medium,
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
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SIZES.padding,
    padding: getResponsiveValue(SIZES.padding, SIZES.padding * 1.5, SIZES.padding * 2),
    borderRadius: SIZES.radiusLarge,
    marginBottom: SIZES.padding,
    minHeight: getResponsiveValue(55, 60, 70),
    ...SHADOWS.light.large,
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
    fontSize: getResponsiveValue(SIZES.body, SIZES.title, SIZES.title + 2),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveValue(SIZES.padding * 1.5, SIZES.padding * 2, SIZES.padding * 2.5),
    paddingVertical: getResponsiveValue(SIZES.padding, SIZES.padding * 1.2, SIZES.padding * 1.5),
    borderRadius: SIZES.radiusLarge,
    marginTop: SIZES.padding * 2,
    ...SHADOWS.light.medium,
  },
  backButtonText: {
    ...FONTS.body,
    color: 'white',
    fontWeight: '600',
    marginRight: SIZES.base,
    fontSize: getResponsiveValue(SIZES.bodySmall, SIZES.body, SIZES.body + 1),
  },
  medicalInfoContainer: {
    marginTop: SIZES.padding,
    marginBottom: SIZES.padding,
    backgroundColor: 'rgba(0,0,0,0.01)',
    borderRadius: SIZES.radius,
    padding: getResponsiveValue(SIZES.padding * 0.7, SIZES.padding, SIZES.padding * 1.2),
  },
  medicalInfoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  medicalInfoIconContainer: {
    width: getResponsiveValue(32, 40, 44),
    height: getResponsiveValue(32, 40, 44),
    borderRadius: getResponsiveValue(16, 20, 22),
    backgroundColor: COLORS.roles.paramedicLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SIZES.padding,
  },
  medicalInfoContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  medicalInfoLabel: {
    ...FONTS.caption,
    fontWeight: '600',
    marginBottom: 2,
    fontSize: getResponsiveValue(SIZES.caption - 1, SIZES.caption, SIZES.caption + 1),
  },
  medicalInfoValue: {
    ...FONTS.body,
    fontWeight: '500',
    fontSize: getResponsiveValue(SIZES.bodySmall, SIZES.body, SIZES.body + 1),
    textAlign: 'right',
  },
  medicalInfoDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.07)',
    marginVertical: SIZES.base,
    width: '100%',
    alignSelf: 'center',
  },
});