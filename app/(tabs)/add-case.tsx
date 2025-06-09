import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  useColorScheme,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import Colors from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

type CasePayload = {
  patientInfo: {
    firstName: string;
    lastName: string;
    medicalHistory: string;
    currentNeeds: string;
    bloodType: string;
  };
  assignedHospitalId: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  paramedicId: string;
  createdAt: any;
};

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function AddCaseScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme || 'light'];
  const { userRole } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    medicalHistory: '',
    currentNeeds: '',
    bloodType: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'الاسم الأول مطلوب';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'اسم العائلة مطلوب';
    }
    if (!formData.currentNeeds.trim()) {
      newErrors.currentNeeds = 'الاحتياجات الطبية مطلوبة';
    }
    if (!formData.bloodType) {
      newErrors.bloodType = 'فصيلة الدم مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('تنبيه', 'يرجى إكمال جميع الحقول المطلوبة');
      return;
    }

    setIsLoading(true);

    const newCase: CasePayload = {
      patientInfo: {
        ...formData,
      },
      assignedHospitalId: null,
      status: 'pending',
      paramedicId: 'DUMMY_PARAMEDIC_ID',
      createdAt: new Date(),
    };

    try {
      console.log('Sending to Firebase:', JSON.stringify(newCase, null, 2));
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert('نجاح', 'تم إرسال بيانات الحالة بنجاح.', [
        { text: 'موافق', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    field: string,
    placeholder: string,
    multiline: boolean = false,
    numberOfLines: number = 1
  ) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
          { color: theme.text, backgroundColor: theme.card },
          errors[field] && styles.inputError
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        value={formData[field as keyof typeof formData]}
        onChangeText={(value) => handleInputChange(field, value)}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlign="right"
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
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
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>معلومات المريض</Text>
            <View style={[styles.inputGroup, { backgroundColor: theme.card }]}>
              {renderInput('firstName', 'الاسم الأول')}
              {renderInput('lastName', 'اسم العائلة')}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>فصيلة الدم</Text>
            <View style={[styles.pickerWrapper, { backgroundColor: theme.card }]}>
              <Picker
                selectedValue={formData.bloodType}
                onValueChange={(value) => handleInputChange('bloodType', value)}
                dropdownIconColor={theme.text}
                style={{ color: theme.text }}
              >
                <Picker.Item label="اختر فصيلة الدم" value="" />
                {BLOOD_TYPES.map(type => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>
            {errors.bloodType && (
              <Text style={styles.errorText}>{errors.bloodType}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>التاريخ الطبي</Text>
            {renderInput('medicalHistory', 'مثال: حساسية بنسلين، مرض السكري...', true, 4)}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>الاحتياجات الحالية</Text>
            {renderInput('currentNeeds', 'مثال: فصيلة دم O+، بحاجة لتدخل جراحي عاجل...', true, 4)}
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: COLORS.roles.paramedic },
              isLoading && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <MaterialCommunityIcons name="send" size={22} color="white" style={styles.buttonIcon} />
                <Text style={styles.submitButtonText}>إرسال الحالة</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  section: {
    marginBottom: SIZES.large,
  },
  sectionTitle: {
    ...FONTS.title,
    marginBottom: SIZES.small,
    textAlign: 'right',
  },
  inputContainer: {
    marginBottom: SIZES.small,
  },
  inputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    ...SHADOWS.light.small,
  },
  input: {
    flex: 1,
    height: 55,
    paddingHorizontal: SIZES.padding,
    fontSize: SIZES.body,
    borderWidth: 1,
    borderColor: 'transparent',
    textAlign: 'right',
    borderRadius: SIZES.radius,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: SIZES.padding,
  },
  inputError: {
    borderColor: COLORS.accent.error,
  },
  errorText: {
    color: COLORS.accent.error,
    fontSize: SIZES.caption,
    marginTop: 4,
    textAlign: 'right',
  },
  pickerWrapper: {
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
    ...SHADOWS.light.small,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginTop: SIZES.large,
    ...SHADOWS.light.medium,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    ...FONTS.button,
  },
  buttonIcon: {
    marginRight: SIZES.small,
  },
});
