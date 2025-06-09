import { COLORS } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type StaffMember = {
  name: string;
  role: 'رئيس قسم' | 'مناوب' | 'تحت الطلب' | 'ممرض' | 'أخصائي';
  status: 'available' | 'limited' | 'unavailable';
};

export type ScheduleItem = {
  department: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  lightColor: string;
  staff: StaffMember[];
  totalStaff: number;
  activeStaff: number;
  priority: 'high' | 'medium' | 'low';
};

export const scheduleData: ScheduleItem[] = [
  { 
    department: 'قسم الطوارئ', 
    icon: 'ambulance',
    color: COLORS.status.unavailable,
    lightColor: COLORS.status.unavailableLight,
    totalStaff: 8,
    activeStaff: 5,
    priority: 'high',
    staff: [
      { name: 'د. أحمد محمد خليل', role: 'رئيس قسم', status: 'available' },
      { name: 'د. فاطمة عبد الرحمن', role: 'مناوب', status: 'available' },
      { name: 'أ. سارة علي حسن', role: 'ممرض', status: 'available' },
      { name: 'أ. عمر ياسين محمود', role: 'ممرض', status: 'limited' },
      { name: 'أ. ليلى أحمد', role: 'أخصائي', status: 'available' }
    ]
  },
  { 
    department: 'العناية المركزة', 
    icon: 'heart-pulse',
    color: COLORS.roles.paramedic,
    lightColor: COLORS.roles.paramedicLight,
    totalStaff: 6,
    activeStaff: 4,
    priority: 'high',
    staff: [
      { name: 'د. هبة مصطفى كامل', role: 'رئيس قسم', status: 'available' },
      { name: 'د. محمد عبد الله', role: 'مناوب', status: 'available' },
      { name: 'أ. ليلى حسن علي', role: 'ممرض', status: 'available' },
      { name: 'أ. نورا سعد', role: 'ممرض', status: 'available' }
    ]
  },
  { 
    department: 'قسم الجراحة', 
    icon: 'hospital-box',
    color: COLORS.roles.hospital,
    lightColor: COLORS.roles.hospitalLight,
    totalStaff: 7,
    activeStaff: 3,
    priority: 'medium',
    staff: [
      { name: 'د. محمود كامل سليم', role: 'رئيس قسم', status: 'limited' },
      { name: 'د. رنا وليد', role: 'مناوب', status: 'available' },
      { name: 'أ. هالة محمد', role: 'ممرض', status: 'available' }
    ]
  },
  { 
    department: 'قسم الأطفال', 
    icon: 'baby-face',
    color: COLORS.accent.info,
    lightColor: '#E0F7FA',
    totalStaff: 5,
    activeStaff: 3,
    priority: 'medium',
    staff: [
      { name: 'د. منى أحمد', role: 'رئيس قسم', status: 'available' },
      { name: 'أ. زينب حسام', role: 'ممرض', status: 'available' },
      { name: 'أ. سمر علي', role: 'ممرض', status: 'limited' }
    ]
  }
]; 