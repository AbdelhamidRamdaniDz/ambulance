import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

type ScheduleItem = {
  department: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
  staff: string[];
};

const scheduleData: ScheduleItem[] = [
  { 
    department: 'الطوارئ (ER)', 
    icon: 'flash-alert',
    color: COLORS.status.unavailable,
    staff: ['د. أحمد خليل (مناوب)', 'م. سارة علي', 'م. عمر ياسين'] 
  },
  { 
    department: 'العناية المركزة (ICU)', 
    icon: 'heart-pulse',
    color: COLORS.roles.paramedic,
    staff: ['د. هبة مصطفى (رئيس قسم)', 'م. ليلى حسن'] 
  },
  { 
    department: 'قسم الجراحة', 
    icon: 'medical-bag',
    color: COLORS.roles.hospital,
    staff: ['د. محمود كامل (تحت الطلب)', 'م. رنا وليد'] 
  },
];

export default function HospitalScheduleScreen() {
  const colorScheme = useColorScheme();
  const theme = COLORS[colorScheme || 'light'];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'جدول المناوبات',
          headerStyle: { backgroundColor: theme.card },
          headerTitleStyle: { color: theme.text, ...FONTS.title },
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>الطاقم المناوب حالياً</Text>
        
        {scheduleData.map((item) => (
          <View key={item.department} style={[styles.card, { backgroundColor: theme.card, borderLeftColor: item.color }]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
              <Text style={[styles.departmentTitle, { color: theme.text }]}>{item.department}</Text>
            </View>
            <View style={styles.staffList}>
              {item.staff.map((name, index) => (
                <Text key={index} style={[styles.staffName, { color: theme.textSecondary }]}>• {name}</Text>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: SIZES.padding / 1.5 },
  pageTitle: {
    ...FONTS.h1,
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  card: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding / 1.5,
    elevation: 3,
    shadowColor: '#000', 
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderLeftWidth: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: SIZES.base * 1.5,
    marginBottom: SIZES.base * 1.5,
    borderColor: '#eee',
  },
  departmentTitle: {
    ...FONTS.h2,
    marginHorizontal: SIZES.base,
  },
  staffList: {
    paddingHorizontal: SIZES.base,
  },
  staffName: {
    ...FONTS.h3,
    lineHeight: 28,
  },
});