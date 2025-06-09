import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { scheduleData } from '../../data/schedule';

// تفعيل الاتجاه العربي
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);


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

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high': return 'alert-circle';
    case 'medium': return 'information';
    case 'low': return 'check-circle';
    default: return 'help-circle';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return COLORS.status.unavailable;
    case 'medium': return COLORS.status.limited;
    case 'low': return COLORS.status.available;
    default: return COLORS.accent.secondary;
  }
};

export default function HospitalScheduleScreen() {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme || 'light'];
  const shadows = SHADOWS[colorScheme || 'light'];
  const router = useRouter();

  const totalActiveStaff = scheduleData.reduce((sum, item) => sum + item.activeStaff, 0);
  const totalStaff = scheduleData.reduce((sum, item) => sum + item.totalStaff, 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'جدول المناوبات',
          headerStyle: { backgroundColor: theme.card },
          headerTitleStyle: { 
            color: theme.text, 
            ...FONTS.title
          },
        }}
      />

      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* عنوان الصفحة */}
        <View style={styles.headerSection}>
          <Text style={[styles.pageTitle, { color: theme.text }]}>
            الطاقم الطبي المناوب
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            حالة الأقسام الطبية في المستشفى
          </Text>
        </View>

        {/* بطاقات الإحصائيات */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card }, shadows.small]}>
            <View style={styles.statContent}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.accent.primary + '20' }]}>
                <MaterialCommunityIcons 
                  name="account-group" 
                  size={SIZES.icon.large} 
                  color={COLORS.accent.primary} 
                />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statNumber, { color: theme.text }]}>
                  {totalActiveStaff}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  طاقم نشط
                </Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.card }, shadows.small]}>
            <View style={styles.statContent}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.accent.success + '20' }]}>
                <MaterialCommunityIcons 
                  name="hospital-building" 
                  size={SIZES.icon.large} 
                  color={COLORS.accent.success} 
                />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statNumber, { color: theme.text }]}>
                  {scheduleData.length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  قسم نشط
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }, shadows.small]}>
            <View style={styles.statContent}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.accent.warning + '20' }]}>
                <MaterialCommunityIcons 
                  name="percent" 
                  size={SIZES.icon.large} 
                  color={COLORS.accent.warning} 
                />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={[styles.statNumber, { color: theme.text }]}>
                  {Math.round((totalActiveStaff / totalStaff) * 100)}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  نسبة التوفر
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* بطاقات الأقسام */}
        <View style={styles.departmentsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            الأقسام الطبية
          </Text>
          
          {scheduleData.map((item, index) => (
            <TouchableOpacity 
              key={item.department} 
              style={[
                styles.departmentCard, 
                { backgroundColor: theme.card },
                shadows.medium
              ]}
              activeOpacity={0.92}
              onPress={() => router.push({
                pathname: "/department-detail/[departmentId]",
                params: { departmentId: item.department }
              })}
            >
              {/* رأس البطاقة */}
              <View style={styles.cardHeader}>
                <View style={styles.headerRight}>
                  <View style={[styles.departmentIconContainer, { backgroundColor: item.lightColor }]}>
                    <MaterialCommunityIcons 
                      name={item.icon} 
                      size={SIZES.icon.medium} 
                      color={item.color} 
                    />
                  </View>
                  <View style={styles.departmentInfo}>
                    <Text style={[styles.departmentTitle, { color: theme.text }]}>
                      {item.department}
                    </Text>
                    <Text style={[styles.staffCount, { color: theme.textSecondary }]}>
                      {item.activeStaff} من أصل {item.totalStaff} متاح
                    </Text>
                  </View>
                </View>
                
                <View style={styles.headerLeft}>
                  <View style={styles.priorityIndicator}>
                    <MaterialCommunityIcons 
                      name={getPriorityIcon(item.priority)} 
                      size={SIZES.icon.small} 
                      color={getPriorityColor(item.priority)} 
                    />
                  </View>
                </View>
              </View>

              {/* شريط التقدم */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: theme.borderLight }]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        backgroundColor: item.color,
                        width: `${(item.activeStaff / item.totalStaff) * 100}%`
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.progressText, { color: theme.textTertiary }]}>
                  {Math.round((item.activeStaff / item.totalStaff) * 100)}% متاح
                </Text>
              </View>

              {/* قائمة الموظفين */}
              <View style={styles.staffContainer}>
                {item.staff.map((member, staffIndex) => (
                  <View key={staffIndex} style={styles.staffItem}>
                    <View style={styles.staffLeft}>
                      <View style={styles.staffAvatar}>
                        <MaterialCommunityIcons 
                          name="account-circle" 
                          size={SIZES.icon.medium} 
                          color={theme.textTertiary} 
                        />
                      </View>
                      <View style={styles.staffDetails}>
                        <Text style={[styles.staffName, { color: theme.text }]}>
                          {member.name}
                        </Text>
                        <Text style={[styles.staffRole, { color: theme.textSecondary }]}>
                          {member.role}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.staffRight}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(member.status) + '20' }]}>
                        <View 
                          style={[
                            styles.statusDot, 
                            { backgroundColor: getStatusColor(member.status) }
                          ]} 
                        />
                        <Text 
                          style={[
                            styles.statusText, 
                            { color: getStatusColor(member.status) }
                          ]}
                        >
                          {getStatusText(member.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* تذييل الصفحة */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <MaterialCommunityIcons 
              name="clock-outline" 
              size={SIZES.icon.small} 
              color={theme.textTertiary} 
            />
            <Text style={[styles.footerText, { color: theme.textTertiary }]}>
              آخر تحديث: اليوم الساعة 2:30 مساءً
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1,
  },
  
  container: { 
    padding: SIZES.paddingHorizontal,
    paddingBottom: SIZES.padding * 2,
  },
  
  // Header Section
  headerSection: {
    marginBottom: SIZES.large,
    alignItems: 'center',
  },
  
  pageTitle: {
    ...FONTS.h1,
    textAlign: 'center',
    marginBottom: SIZES.small,
  },
  
  subtitle: {
    ...FONTS.body,
    textAlign: 'center',
  },
  
  // Stats Section
  statsContainer: {
    marginBottom: SIZES.large,
    gap: SIZES.medium,
  },
  
  statCard: {
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.padding,
    marginBottom: SIZES.small,
  },

  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statIconContainer: {
    width: SIZES.avatar.medium,
    height: SIZES.avatar.medium,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: SIZES.medium,
  },
  
  statNumber: {
    ...FONTS.h2,
    fontWeight: '700',
  },
  
  statLabel: {
    ...FONTS.bodySmall,
    marginTop: SIZES.base / 2,
  },

  // Departments Section
  departmentsContainer: {
    marginBottom: SIZES.large,
  },

  sectionTitle: {
    ...FONTS.h3,
    marginBottom: SIZES.padding,
    textAlign: 'right',
  },
  
  departmentCard: {
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  headerLeft: {
    marginLeft: SIZES.medium,
  },
  
  departmentIconContainer: {
    width: SIZES.avatar.small + SIZES.small,
    height: SIZES.avatar.small + SIZES.small,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SIZES.medium,
  },
  
  departmentInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  
  departmentTitle: {
    ...FONTS.h4,
    marginBottom: SIZES.base / 2,
    textAlign: 'right',
  },
  
  staffCount: {
    ...FONTS.bodySmall,
    textAlign: 'right',
  },

  priorityIndicator: {
    padding: SIZES.small,
  },
  
  // Progress Section
  progressContainer: {
    marginBottom: SIZES.padding,
  },
  
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SIZES.small,
  },
  
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  progressText: {
    ...FONTS.caption,
    textAlign: 'right',
  },
  
  // Staff Section
  staffContainer: {
    gap: SIZES.medium,
  },
  
  staffItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.small,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: SIZES.radiusSmall,
  },
  
  staffLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  staffAvatar: {
    marginLeft: SIZES.medium,
  },
  
  staffDetails: {
    flex: 1,
    alignItems: 'flex-end',
  },
  
  staffName: {
    ...FONTS.body,
    marginBottom: SIZES.base / 2,
    textAlign: 'right',
  },
  
  staffRole: {
    ...FONTS.caption,
    textAlign: 'right',
  },
  
  staffRight: {
    marginRight: SIZES.medium,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.small,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radiusSmall,
  },
  
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: SIZES.base / 2,
  },
  
  statusText: {
    ...FONTS.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  
  // Footer Section
  footer: {
    alignItems: 'center',
    marginTop: SIZES.large,
    paddingTop: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },

  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  footerText: {
    ...FONTS.caption,
    marginRight: SIZES.small,
  },
});