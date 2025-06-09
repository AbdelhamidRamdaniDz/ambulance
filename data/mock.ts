// defining the types for our data structure
export type CaseStatus = 'completed' | 'rejected';
export type PatientLogEntry = {
  id: string;
  patientName: string;
  date: string; // The primary timestamp for the event
  entryDate: string;
  dischargeDate: string;
  condition: string;
  detailedNotes: string;
  status: CaseStatus;
  assignedHospital: string;
  bloodType: string; // تمت إضافة زمرة الدم
};

// Mock data for the patient log
export const mockLogData: PatientLogEntry[] = [
  { 
    id: '1', 
    patientName: 'أحمد علي', 
    date: '2024-10-25 14:30', 
    entryDate: '2024-10-25 14:30', 
    dischargeDate: '2024-10-26 10:00', 
    condition: 'أزمة قلبية', 
    detailedNotes: 'تم استقبال المريض في حالة حرجة، تم إجراء قسطرة قلبية عاجلة وتركيب دعامة. الحالة مستقرة الآن.', 
    status: 'completed',
    assignedHospital: 'مستشفى الجلفة المركزي',
    bloodType: 'O+'
  },
  { 
    id: '2', 
    patientName: 'فاطمة الزهراء', 
    date: '2024-10-25 11:15',
    entryDate: '2024-10-25 11:15', 
    dischargeDate: '2024-10-28 17:00', 
    condition: 'كسر في الساق', 
    detailedNotes: 'كسر مضاعف في عظمة الفخذ اليسرى، تم إجراء عملية جراحية لتثبيت الكسر. تحتاج إلى متابعة وعلاج طبيعي.', 
    status: 'completed',
    assignedHospital: 'مستشفى طب العيون',
    bloodType: 'A-'
  },
  { 
    id: '3', 
    patientName: 'خالد محمود', 
    date: '2024-10-24 22:00',
    entryDate: '2024-10-24 22:00', 
    dischargeDate: 'N/A', 
    condition: 'حالة غير حرجة', 
    detailedNotes: 'تم رفض الحالة نظرًا لعدم توفر تخصص الأنف والأذن والحنجرة في ذلك الوقت.', 
    status: 'rejected',
    assignedHospital: 'مستشفى الجلفة المركزي',
    bloodType: 'B+'
  },
  { 
    id: '4', 
    patientName: 'مريم سعيد', 
    date: '2024-10-24 19:45',
    entryDate: '2024-10-24 19:45', 
    dischargeDate: '2024-10-25 12:30', 
    condition: 'صعوبة في التنفس', 
    detailedNotes: 'التهاب رئوي حاد، تم وضع المريضة على جهاز التنفس الصناعي لمدة 12 ساعة. استجابت بشكل جيد للعلاج.', 
    status: 'completed',
    assignedHospital: 'مستشفى الأم والطفل',
    bloodType: 'AB+'
  },
];
