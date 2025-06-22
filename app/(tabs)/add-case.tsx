import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Alert, useColorScheme, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

const API_BASE_URL = 'https://3510-129-45-33-55.ngrok-free.app/api'; 

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function AddCaseScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const theme = COLORS[colorScheme];
  const shadow = SHADOWS[colorScheme];
  const auth = useContext(AuthContext) as AuthContextType;
  
  const params = useLocalSearchParams<{ hospitalId?: string, hospitalName?: string }>();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    medicalHistory: '',
    currentNeeds: '',
    bloodType: '',
    assignedHospital: params.hospitalId || '',
  });
  
  const [hospitals, setHospitals] = useState<{ label: string, value: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      // جلب قائمة المستشفيات المتاحة عند تحميل الشاشة
      const fetchHospitals = async () => {
          if (!auth.authToken) return;
          try {
              const response = await fetch(`${API_BASE_URL}/hospitals/status`, {
                  headers: { 'Authorization': `Bearer ${auth.authToken}` }
              });
              const data = await response.json();
              if (data.success) {
                  const availableHospitals = data.data
                      .filter(h => h.isERAvailable)
                      .map(h => ({ label: h.hospital.name, value: h.hospital._id }));
                  setHospitals(availableHospitals);
              }
          } catch (error) {
              console.error("Failed to fetch hospitals:", error);
          }
      };
      fetchHospitals();
  }, [auth.authToken]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.currentNeeds || !formData.assignedHospital) {
      Alert.alert('حقول مطلوبة', 'يرجى إدخال اسم المريض، احتياجاته الحالية، واختيار المستشفى.');
      return;
    }

    setIsLoading(true);

    const caseData = {
      patientInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bloodType: formData.bloodType,
        medicalHistory: formData.medicalHistory,
        currentNeeds: formData.currentNeeds,
      },
      assignedHospital: formData.assignedHospital,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.authToken}`
        },
        body: JSON.stringify(caseData),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create case');
      }

      Alert.alert('نجاح', 'تم إرسال الحالة بنجاح.', [
        { text: 'OK', onPress: () => router.back() },
      ]);

    } catch (error) {
      Alert.alert('خطأ في الإرسال', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: 'إضافة حالة جديدة',
          headerStyle: { backgroundColor: theme.card },
          headerTitleStyle: { color: theme.text, ...FONTS.title },
          headerTintColor: theme.text,
        }}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
            
            <View style={[styles.section, { backgroundColor: theme.card, ...shadow.small }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>المستشفى المعين</Text>
              <View style={[styles.pickerWrapper, {borderColor: theme.border}]}>
                  <Picker 
                    selectedValue={formData.assignedHospital} 
                    onValueChange={(val) => handleInputChange('assignedHospital', val)} 
                    style={{color: theme.text}}
                    enabled={!params.hospitalId} // تعطيل الاختيار إذا تم تمريره من الخريطة
                  >
                      <Picker.Item label={params.hospitalName || "اختر مستشفى متاح..."} value={params.hospitalId || ""} />
                      {hospitals.map(h => <Picker.Item key={h.value} label={h.label} value={h.value} />)}
                  </Picker>
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: theme.card, ...shadow.small }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>معلومات المريض</Text>
              <TextInput style={[styles.input, {color: theme.text, borderColor: theme.border}]} placeholder="الاسم الأول" onChangeText={val => handleInputChange('firstName', val)} />
              <TextInput style={[styles.input, {color: theme.text, borderColor: theme.border}]} placeholder="اسم العائلة" onChangeText={val => handleInputChange('lastName', val)} />
            </View>

            <View style={[styles.section, { backgroundColor: theme.card, ...shadow.small }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>التفاصيل الطبية</Text>
                <View style={[styles.pickerWrapper, {borderColor: theme.border}]}>
                    <Picker selectedValue={formData.bloodType} onValueChange={val => handleInputChange('bloodType', val)} style={{color: theme.text}}>
                        <Picker.Item label="اختر فصيلة الدم..." value="" />
                        {BLOOD_TYPES.map(type => <Picker.Item key={type} label={type} value={type} />)}
                    </Picker>
                </View>
                <TextInput style={[styles.textArea, {color: theme.text, borderColor: theme.border}]} placeholder="الاحتياجات الحالية (مثال: بحاجة لتدخل جراحي عاجل...)" onChangeText={val => handleInputChange('currentNeeds', val)} multiline/>
                <TextInput style={[styles.textArea, {color: theme.text, borderColor: theme.border}]} placeholder="التاريخ الطبي (مثال: حساسية بنسلين...)" onChangeText={val => handleInputChange('medicalHistory', val)} multiline/>
            </View>
            
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: COLORS.roles.paramedic }, isLoading && styles.submitButtonDisabled, shadow.medium]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#ffffff" /> : (
                  <>
                    <MaterialCommunityIcons name="send" size={SIZES.icon.medium} color="white" />
                    <Text style={styles.submitButtonText}>تأكيد وإرسال الحالة</Text>
                  </>
              )}
            </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: SIZES.padding },
  section: {
    marginBottom: SIZES.large,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.padding,
  },
  sectionTitle: { ...FONTS.h4, marginBottom: SIZES.medium, textAlign: 'right' },
  input: { 
    ...FONTS.body, 
    height: 55, 
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    textAlign: 'right',
    marginBottom: SIZES.medium,
  },
  textArea: {
    ...FONTS.body, 
    height: 110, 
    padding: SIZES.medium,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    textAlign: 'right',
    textAlignVertical: 'top',
    marginBottom: SIZES.medium,
  },
  pickerWrapper: { 
    borderRadius: SIZES.radius, 
    borderWidth: 1,
    marginBottom: SIZES.medium,
    justifyContent: 'center',
  },
  submitButton: { 
    flexDirection: 'row-reverse',
    justifyContent: 'center', 
    alignItems: 'center',
    gap: SIZES.small,
    padding: SIZES.padding, 
    borderRadius: SIZES.radiusLarge, 
    marginTop: SIZES.base,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { ...FONTS.button, color: 'white' },
});
