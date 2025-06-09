import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
  I18nManager,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { scheduleData } from '../../data/schedule';
import { LinearGradient } from 'expo-linear-gradient';

// Force RTL layout
I18nManager.forceRTL(true);

const { width, height } = Dimensions.get('window');

// Responsive breakpoints
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;
const isLargeScreen = width >= 768;
const isTablet = width >= 768;

// Responsive dimensions
const getResponsivePadding = () => {
  if (isSmallScreen) return SIZES.padding * 0.8;
  if (isMediumScreen) return SIZES.padding;
  return SIZES.padding * 1.2;
};

const getResponsiveRadius = () => {
  if (isSmallScreen) return SIZES.radius;
  if (isMediumScreen) return SIZES.radiusLarge;
  return SIZES.radiusLarge * 1.2;
};

const getHeroHeight = () => {
  if (isSmallScreen) return 160;
  if (isMediumScreen) return 200;
  return 240;
};

const getStatsColumns = () => {
  if (isTablet) return 3;
  return 3;
};

export default function DepartmentDetailScreen() {
  const { departmentId } = useLocalSearchParams<{ departmentId: string }>();
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme || 'light'];
  const router = useRouter();
  const scrollY = new Animated.Value(0);

  const department = scheduleData.find(d => d.department === departmentId);
  const responsivePadding = getResponsivePadding();
  const responsiveRadius = getResponsiveRadius();

  if (!department) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.notFoundContainer}>
          <View style={[
            styles.notFoundIconContainer, 
            { 
              backgroundColor: theme.card,
              width: isSmallScreen ? 100 : 120,
              height: isSmallScreen ? 100 : 120,
              borderRadius: isSmallScreen ? 50 : 60,
            }
          ]}>
            <MaterialCommunityIcons 
              name="hospital-building" 
              size={isSmallScreen ? 60 : 80} 
              color={theme.textSecondary} 
            />
          </View>
          <Text style={[
            styles.notFoundTitle, 
            { 
              color: theme.text,
              fontSize: isSmallScreen ? FONTS.h3.fontSize : FONTS.h2.fontSize,
            }
          ]}>
            لم يتم العثور على القسم
          </Text>
          <Text style={[
            styles.notFoundSubtitle, 
            { 
              color: theme.textSecondary,
              fontSize: isSmallScreen ? FONTS.caption.fontSize : FONTS.body.fontSize,
            }
          ]}>
            يبدو أن هذا القسم غير موجود أو تم حذفه
          </Text>
          <TouchableOpacity
            style={[
              styles.backButton, 
              { 
                backgroundColor: COLORS.roles.hospital,
                paddingHorizontal: responsivePadding * 1.5,
                paddingVertical: responsivePadding * 0.8,
                borderRadius: responsiveRadius,
              }
            ]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
            <Text style={[
              styles.backButtonText,
              { fontSize: isSmallScreen ? FONTS.caption.fontSize : FONTS.body.fontSize }
            ]}>
              العودة للقائمة
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const availabilityPercentage = Math.round((department.activeStaff / department.totalStaff) * 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: department.department,
          headerStyle: { 
            backgroundColor: theme.card,
          },
          headerTitleStyle: {
            color: theme.text,
            fontSize: isSmallScreen ? FONTS.h4.fontSize : FONTS.title.fontSize,
          },
          headerTintColor: theme.text,
          headerBackground: () => (
            <Animated.View 
              style={[
                { backgroundColor: theme.card, flex: 1 },
                { opacity: headerOpacity }
              ]} 
            />
          ),
        }}
      />

      <Animated.ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: isTablet ? responsivePadding * 2 : 0 }
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Header Hero Section */}
        <View style={[
          styles.heroSection, 
          { 
            backgroundColor: department.color,
            height: getHeroHeight(),
            marginBottom: isSmallScreen ? -40 : -50,
          }
        ]}>
          <LinearGradient
            colors={[department.color, department.color + 'DD']}
            style={styles.heroGradient}
          >
            <View style={[styles.heroContent, { paddingHorizontal: responsivePadding }]}>
              <View style={[
                styles.heroIconContainer, 
                { 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  width: isSmallScreen ? 64 : 80,
                  height: isSmallScreen ? 64 : 80,
                  borderRadius: isSmallScreen ? 32 : 40,
                }
              ]}>
                <MaterialCommunityIcons 
                  name={department.icon} 
                  size={isSmallScreen ? 36 : 48} 
                  color="white" 
                />
              </View>
              <Text style={[
                styles.heroTitle,
                { 
                  fontSize: isSmallScreen ? FONTS.h3.fontSize : FONTS.h2.fontSize,
                  marginBottom: isSmallScreen ? SIZES.base * 0.5 : SIZES.base,
                }
              ]}>
                {department.department}
              </Text>
              <Text style={[
                styles.heroSubtitle,
                { fontSize: isSmallScreen ? FONTS.caption.fontSize : FONTS.body.fontSize }
              ]}>
                {department.activeStaff} من {department.totalStaff} أعضاء الطاقم متاحون
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Stats Cards */}
        <View style={[
          styles.statsContainer,
          {
            paddingHorizontal: responsivePadding,
            marginBottom: responsivePadding,
            marginTop: responsivePadding * 5,
            gap: isSmallScreen ? SIZES.base : SIZES.small,
            flexWrap: isTablet ? 'nowrap' : 'wrap',
          }
        ]}>
          <View style={[
            styles.statCard, 
            { 
              backgroundColor: theme.card,
              borderRadius: responsiveRadius,
              padding: isSmallScreen ? responsivePadding * 0.8 : responsivePadding,
              minWidth: isTablet ? 0 : width * 0.28,
              flex: isTablet ? 1 : 0,
            }
          ]}>
            <View style={[
              styles.statIconContainer, 
              { 
                backgroundColor: COLORS.status.available + '20',
                width: isSmallScreen ? 40 : 48,
                height: isSmallScreen ? 40 : 48,
                borderRadius: isSmallScreen ? 20 : 24,
              }
            ]}>
              <MaterialCommunityIcons 
                name="account-check" 
                size={isSmallScreen ? 20 : 24} 
                color={COLORS.status.available} 
              />
            </View>
            <Text style={[
              styles.statValue, 
              { 
                color: theme.text,
                fontSize: isSmallScreen ? FONTS.h3.fontSize : FONTS.h2.fontSize,
              }
            ]}>
              {department.activeStaff}
            </Text>
            <Text style={[
              styles.statLabel, 
              { 
                color: theme.textSecondary,
                fontSize: isSmallScreen ? FONTS.caption.fontSize : FONTS.caption.fontSize,
              }
            ]}>
              طاقم نشط
            </Text>
          </View>

          <View style={[
            styles.statCard, 
            { 
              backgroundColor: theme.card,
              borderRadius: responsiveRadius,
              padding: isSmallScreen ? responsivePadding * 0.8 : responsivePadding,
              minWidth: isTablet ? 0 : width * 0.28,
              flex: isTablet ? 1 : 0,
            }
          ]}>
            <View style={[
              styles.statIconContainer, 
              { 
                backgroundColor: COLORS.accent.primary + '20',
                width: isSmallScreen ? 40 : 48,
                height: isSmallScreen ? 40 : 48,
                borderRadius: isSmallScreen ? 20 : 24,
              }
            ]}>
              <MaterialCommunityIcons 
                name="account-group" 
                size={isSmallScreen ? 20 : 24} 
                color={COLORS.accent.primary} 
              />
            </View>
            <Text style={[
              styles.statValue, 
              { 
                color: theme.text,
                fontSize: isSmallScreen ? FONTS.h3.fontSize : FONTS.h2.fontSize,
              }
            ]}>
              {department.totalStaff}
            </Text>
            <Text style={[
              styles.statLabel, 
              { 
                color: theme.textSecondary,
                fontSize: isSmallScreen ? FONTS.caption.fontSize : FONTS.caption.fontSize,
              }
            ]}>
              إجمالي الطاقم
            </Text>
          </View>

          <View style={[
            styles.statCard, 
            { 
              backgroundColor: theme.card,
              borderRadius: responsiveRadius,
              padding: isSmallScreen ? responsivePadding * 0.8 : responsivePadding,
              minWidth: isTablet ? 0 : width * 0.28,
              flex: isTablet ? 1 : 0,
            }
          ]}>
            <View style={[
              styles.statIconContainer, 
              { 
                backgroundColor: getAvailabilityColor(availabilityPercentage) + '20',
                width: isSmallScreen ? 40 : 48,
                height: isSmallScreen ? 40 : 48,
                borderRadius: isSmallScreen ? 20 : 24,
              }
            ]}>
              <MaterialCommunityIcons 
                name="chart-line" 
                size={isSmallScreen ? 20 : 24} 
                color={getAvailabilityColor(availabilityPercentage)} 
              />
            </View>
            <Text style={[
              styles.statValue, 
              { 
                color: theme.text,
                fontSize: isSmallScreen ? FONTS.h3.fontSize : FONTS.h2.fontSize,
              }
            ]}>
              {availabilityPercentage}%
            </Text>
            <Text style={[
              styles.statLabel, 
              { 
                color: theme.textSecondary,
                fontSize: isSmallScreen ? FONTS.caption.fontSize : FONTS.caption.fontSize,
              }
            ]}>
              نسبة التوفر
            </Text>
          </View>
        </View>

        {/* Content Container for larger screens */}
        <View style={isTablet ? styles.contentGrid : styles.contentStack}>
          {/* Left Column */}
          <View style={isTablet ? styles.leftColumn : undefined}>
            {/* Availability Progress */}
            <View style={[
              styles.section, 
              { 
                backgroundColor: theme.card,
                borderRadius: responsiveRadius,
                padding: responsivePadding,
                marginHorizontal: isTablet ? 0 : responsivePadding,
                marginBottom: responsivePadding,
              }
            ]}>
              <View style={styles.sectionHeader}>
                <Text style={[
                  styles.sectionTitle, 
                  { 
                    color: theme.text,
                    fontSize: isSmallScreen ? FONTS.body.fontSize : FONTS.h4.fontSize,
                  }
                ]}>
                  حالة التوفر
                </Text>
                <View style={[
                  styles.iconContainer, 
                  { 
                    backgroundColor: COLORS.accent.success + '20',
                    width: isSmallScreen ? 36 : 40,
                    height: isSmallScreen ? 36 : 40,
                    borderRadius: isSmallScreen ? 18 : 20,
                  }
                ]}>
                  <MaterialCommunityIcons 
                    name="chart-donut" 
                    size={isSmallScreen ? 20 : 24} 
                    color={COLORS.accent.success} 
                  />
                </View>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressInfo}>
                  <Text style={[
                    styles.progressLabel, 
                    { 
                      color: theme.text,
                      fontSize: isSmallScreen ? FONTS.caption.fontSize : FONTS.body.fontSize,
                    }
                  ]}>
                    معدل التوفر: {availabilityPercentage}%
                  </Text>
                  <Text style={[
                    styles.progressSubtitle, 
                    { 
                      color: theme.textSecondary,
                      fontSize: isSmallScreen ? FONTS.caption.fontSize : FONTS.body.fontSize,
                    }
                  ]}>
                    {getAvailabilityText(availabilityPercentage)}
                  </Text>
                </View>
                <View style={[
                  styles.progressBarContainer, 
                  { 
                    backgroundColor: theme.borderLight,
                    height: isSmallScreen ? 6 : 8,
                    borderRadius: isSmallScreen ? 3 : 4,
                  }
                ]}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${availabilityPercentage}%`,
                        backgroundColor: getAvailabilityColor(availabilityPercentage),
                        borderRadius: isSmallScreen ? 3 : 4,
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>

            {/* Contact Information */}
            <View style={[
              styles.section, 
              { 
                backgroundColor: theme.card,
                borderRadius: responsiveRadius,
                padding: responsivePadding,
                marginHorizontal: isTablet ? 0 : responsivePadding,
                marginBottom: responsivePadding,
              }
            ]}>
              <View style={styles.sectionHeader}>
                <Text style={[
                  styles.sectionTitle, 
                  { 
                    color: theme.text,
                    fontSize: isSmallScreen ? FONTS.body.fontSize : FONTS.h4.fontSize,
                  }
                ]}>
                  معلومات الاتصال
                </Text>
                <View style={[
                  styles.iconContainer, 
                  { 
                    backgroundColor: COLORS.accent.info + '20',
                    width: isSmallScreen ? 36 : 40,
                    height: isSmallScreen ? 36 : 40,
                    borderRadius: isSmallScreen ? 18 : 20,
                  }
                ]}>
                  <MaterialCommunityIcons 
                    name="information" 
                    size={isSmallScreen ? 20 : 24} 
                    color={COLORS.accent.info} 
                  />
                </View>
              </View>

              <View style={[styles.contactInfo, { gap: isSmallScreen ? SIZES.base : SIZES.small }]}>
                <TouchableOpacity 
                  style={[
                    styles.contactItem, 
                    { 
                      backgroundColor: theme.backgroundSecondary,
                      padding: isSmallScreen ? responsivePadding * 0.8 : responsivePadding,
                      borderRadius: responsiveRadius * 0.8,
                    }
                  ]} 
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.contactIconContainer, 
                    { 
                      backgroundColor: COLORS.accent.success + '20',
                      width: isSmallScreen ? 32 : 36,
                      height: isSmallScreen ? 32 : 36,
                      borderRadius: isSmallScreen ? 16 : 18,
                    }
                  ]}>
                    <MaterialCommunityIcons 
                      name="phone" 
                      size={isSmallScreen ? 16 : 20} 
                      color={COLORS.accent.success} 
                    />
                  </View>
                  <View style={styles.contactDetails}>
                    <Text style={[
                      styles.contactLabel, 
                      { 
                        color: theme.textSecondary,
                        fontSize: isSmallScreen ? FONTS.caption.fontSize : FONTS.caption.fontSize,
                      }
                    ]}>
                      رقم الهاتف
                    </Text>
                    <Text style={[
                      styles.contactValue, 
                      { 
                        color: theme.text,
                        fontSize: isSmallScreen ? FONTS.caption.fontSize : FONTS.body.fontSize,
                      }
                    ]}>
                      123-456-7890
                    </Text>
                  </View>
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={isSmallScreen ? 14 : 16} 
                    color={theme.textTertiary} 
                  />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.contactItem, 
                    { 
                      backgroundColor: theme.backgroundSecondary,
                      padding: isSmallScreen ? responsivePadding * 0.8 : responsivePadding,
                      borderRadius: responsiveRadius * 0.8,
                    }
                  ]} 
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.contactIconContainer, 
                    { 
                      backgroundColor: COLORS.accent.warning + '20',
                      width: isSmallScreen ? 32 : 36,
                      height: isSmallScreen ? 32 : 36,
                      borderRadius: isSmallScreen ? 16 : 18,
                    }
                  ]}>
                    <MaterialCommunityIcons 
                      name="clock" 
                      size={isSmallScreen ? 16 : 20} 
                      color={COLORS.accent.warning} 
                    />
                  </View>
                  <View style={styles.contactDetails}>
                    <Text style={[
                      styles.contactLabel, 
                      { 
                        color: theme.textSecondary,
                        fontSize: isSmallScreen ? FONTS.caption.fontSize : FONTS.caption.fontSize,
                      }
                    ]}>
                      آخر تحديث
                    </Text>
                    <Text style={[
                      styles.contactValue, 
                      { 
                        color: theme.text,
                        fontSize: isSmallScreen ? FONTS.caption.fontSize : FONTS.body.fontSize,
                      }
                    ]}>
                      اليوم 2:30 مساءً
                    </Text>
                  </View>
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={isSmallScreen ? 14 : 16} 
                    color={theme.textTertiary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Right Column */}
          <View style={isTablet ? styles.rightColumn : undefined}>
            {/* Staff List */}
            <View style={[
              styles.section, 
              { 
                backgroundColor: theme.card,
                borderRadius: responsiveRadius,
                padding: responsivePadding,
                marginHorizontal: isTablet ? 0 : responsivePadding,
                marginBottom: responsivePadding,
              }
            ]}>
              <View style={styles.sectionHeader}>
                <View style={[
                  styles.staffCounter,
                  {
                    paddingHorizontal: isSmallScreen ? SIZES.base : SIZES.small,
                    paddingVertical: isSmallScreen ? SIZES.base * 0.3 : SIZES.base / 2,
                    borderRadius: responsiveRadius * 0.5,
                  }
                ]}>
                  <Text style={[
                    styles.staffCounterText, 
                    { 
                      color: theme.textSecondary,
                      fontSize: isSmallScreen ? FONTS.caption.fontSize : FONTS.caption.fontSize,
                    }
                  ]}>
                    {department.staff.length} عضو
                  </Text>
                </View>
                <Text style={[
                  styles.sectionTitle, 
                  { 
                    color: theme.text,
                    fontSize: isSmallScreen ? FONTS.body.fontSize : FONTS.h4.fontSize,
                  }
                ]}>
                  الطاقم الطبي
                </Text>
                <View style={[
                  styles.iconContainer, 
                  { 
                    backgroundColor: COLORS.roles.paramedic + '20',
                    width: isSmallScreen ? 36 : 40,
                    height: isSmallScreen ? 36 : 40,
                    borderRadius: isSmallScreen ? 18 : 20,
                  }
                ]}>
                  <MaterialCommunityIcons 
                    name="doctor" 
                    size={isSmallScreen ? 20 : 24} 
                    color={COLORS.roles.paramedic} 
                  />
                </View>
              </View>

              {department.staff.map((member, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.staffItem,
                    index !== department.staff.length - 1 && styles.staffItemBorder,
                    { 
                      borderBottomColor: theme.borderLight,
                      paddingVertical: isSmallScreen ? responsivePadding * 0.8 : responsivePadding,
                    }
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.staffContent}>
                    <View style={[styles.staffStatus, { gap: isSmallScreen ? SIZES.base * 0.5 : SIZES.base }]}>
                      <MaterialCommunityIcons 
                        name="chevron-right" 
                        size={isSmallScreen ? 14 : 16} 
                        color={theme.textTertiary} 
                      />
                      <View style={[
                        styles.statusBadge, 
                        { 
                          backgroundColor: getStatusColor(member.status) + '15',
                          paddingHorizontal: isSmallScreen ? SIZES.base : SIZES.small,
                          paddingVertical: isSmallScreen ? SIZES.base * 0.3 : SIZES.base / 2,
                          borderRadius: responsiveRadius * 0.5,
                        }
                      ]}>
                        <Text style={[
                          styles.statusText, 
                          { 
                            color: getStatusColor(member.status),
                            fontSize: isSmallScreen ? FONTS.caption.fontSize : FONTS.body.fontSize,
                          }
                        ]}>
                          {getStatusText(member.status)}
                        </Text>
                        <View style={[
                          styles.statusDot, 
                          { 
                            backgroundColor: getStatusColor(member.status),
                            width: isSmallScreen ? 5 : 6,
                            height: isSmallScreen ? 5 : 6,
                            borderRadius: isSmallScreen ? 2.5 : 3,
                          }
                        ]} />
                      </View>
                    </View>
                    <View style={[styles.staffInfo, { marginLeft: isSmallScreen ? SIZES.base : SIZES.small }]}>
                      <Text style={[
                        styles.staffName, 
                        { 
                          color: theme.text,
                          fontSize: isSmallScreen ? FONTS.caption.fontSize : FONTS.body.fontSize,
                        }
                      ]}>
                        {member.name}
                      </Text>
                      <Text style={[
                        styles.staffRole, 
                        { 
                          color: theme.textSecondary,
                          fontSize: isSmallScreen ? FONTS.caption.fontSize : FONTS.body.fontSize,
                        }
                      ]}>
                        {member.role}
                      </Text>
                    </View>
                    <View style={[
                      styles.staffAvatar, 
                      { 
                        backgroundColor: getStatusColor(member.status) + '20',
                        width: isSmallScreen ? 36 : 40,
                        height: isSmallScreen ? 36 : 40,
                        borderRadius: isSmallScreen ? 18 : 20,
                      }
                    ]}>
                      <MaterialCommunityIcons 
                        name={getStaffIcon(member.role)} 
                        size={isSmallScreen ? 16 : 20} 
                        color={getStatusColor(member.status)} 
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: responsivePadding * 2 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return COLORS.status.available;
    case 'limited': return COLORS.status.limited;
    case 'unavailable': return COLORS.status.unavailable;
    default: return COLORS.accent.secondary;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'available': return 'متاح';
    case 'limited': return 'محدود';
    case 'unavailable': return 'غير متاح';
    default: return 'غير محدد';
  }
};

const getStaffIcon = (role: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  switch (role.toLowerCase()) {
    case 'doctor': 
    case 'طبيب': return 'doctor';
    case 'nurse':
    case 'ممرض': 
    case 'ممرضة': return 'account';
    case 'technician':
    case 'فنی': return 'account-wrench';
    default: return 'account';
  }
};

const getAvailabilityColor = (percentage: number) => {
  if (percentage >= 80) return COLORS.status.available;
  if (percentage >= 50) return COLORS.status.limited;
  return COLORS.status.unavailable;
};

const getAvailabilityText = (percentage: number) => {
  if (percentage >= 80) return 'توفر ممتاز';
  if (percentage >= 50) return 'توفر جيد';
  return 'توفر محدود';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SIZES.padding,
  },
  
  // Responsive Layout
  contentGrid: {
    flexDirection: 'row',
    gap: SIZES.padding,
    paddingHorizontal: SIZES.padding,
  },
  contentStack: {
    flexDirection: 'column',
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1.5,
  },
  
  // Hero Section
  heroSection: {
    marginBottom: -50,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.padding,
  },
  heroTitle: {
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    ...SHADOWS.light.medium,
  },
  statIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.small,
  },
  statValue: {
    fontWeight: '700',
    marginBottom: SIZES.base / 2,
  },
  statLabel: {
    textAlign: 'center',
  },

  // Sections
  section: {
    ...SHADOWS.light.small,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SIZES.small,
  },
  sectionTitle: {
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  staffCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  staffCounterText: {
    textAlign: 'right',
  },

  // Progress
  progressContainer: {
    marginTop: SIZES.base,
  },
  progressInfo: {
    marginBottom: SIZES.padding,
  },
  progressLabel: {
    fontWeight: '600',
    marginBottom: SIZES.base / 2,
    textAlign: 'right',
  },
  progressSubtitle: {
    textAlign: 'right',
  },
  progressBarContainer: {
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },

  // Staff Items
  staffItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  staffItemBorder: {
    borderBottomWidth: 1,
  },
  staffContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  staffAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontWeight: '600',
    marginBottom: SIZES.base / 2,
    textAlign: 'right',
  },
  staffRole: {
    textAlign: 'right',
  },
  staffStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    marginLeft: SIZES.base / 2,
  },
  statusText: {
    fontWeight: '600',
    textAlign: 'right',
  },

  // Contact Info
  contactInfo: {
    // gap handled dynamically
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactDetails: {
    flex: 1,
    marginRight: SIZES.small,
  },
  contactLabel: {
    marginBottom: SIZES.base / 2,
    textAlign: 'right',
  },
  contactValue: {
    fontWeight: '500',
    textAlign: 'right',
  },

  // Not Found
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  notFoundIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.padding,
    ...SHADOWS.light.medium,
  },
  notFoundTitle: {
    marginBottom: SIZES.base,
    textAlign: 'center',
    fontWeight: '600',
  },
  notFoundSubtitle: {
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
    lineHeight: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.light.medium,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    marginRight: SIZES.base,
  },
});