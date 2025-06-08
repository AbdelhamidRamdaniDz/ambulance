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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [currentNeeds, setCurrentNeeds] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [assignedHospitalId, setAssignedHospitalId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم المريض الكامل.');
      return false;
    }
    if (!currentNeeds.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال الاحتياجات الطبية.');
      return false;
    }
    if (!bloodType) {
      Alert.alert('تنبيه', 'يرجى اختيار فصيلة الدم.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    const newCase: CasePayload = {
      patientInfo: {
        firstName,
        lastName,
        medicalHistory,
        currentNeeds,
        bloodType,
      },
      assignedHospitalId,
      status: 'pending',
      paramedicId: 'DUMMY_PARAMEDIC_ID',
      createdAt: new Date(),
    };

    console.log('Sending to Firebase:', JSON.stringify(newCase, null, 2));
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    Alert.alert('نجاح', 'تم إرسال بيانات الحالة بنجاح.', [
      { text: 'موافق', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen
        options={{
          title: 'إضافة حالة جديدة',
          headerStyle: { backgroundColor: theme.card },
          headerTitleStyle: { color: theme.text },
          headerTintColor: theme.text,
        }}
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>معلومات المريض</Text>

          <View style={[styles.inputGroup, { backgroundColor: theme.card }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="الاسم الأول"
              placeholderTextColor={theme.textSecondary}
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="اسم العائلة"
              placeholderTextColor={theme.textSecondary}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>فصيلة الدم</Text>
          <View style={[styles.pickerWrapper, { backgroundColor: theme.card }]}>
            <Picker
              selectedValue={bloodType}
              onValueChange={(itemValue) => setBloodType(itemValue)}
              dropdownIconColor={theme.text}
              style={{ color: theme.text }}
            >
              <Picker.Item label="اختر فصيلة الدم" value="" />
              {BLOOD_TYPES.map(type => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>التاريخ الطبي</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="مثال: حساسية بنسلين، مرض السكري..."
            placeholderTextColor={theme.textSecondary}
            value={medicalHistory}
            onChangeText={setMedicalHistory}
            multiline
          />

          <Text style={[styles.sectionTitle, { color: theme.text }]}>الاحتياجات الحالية</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="مثال: فصيلة دم O+، بحاجة لتدخل جراحي عاجل..."
            placeholderTextColor={theme.textSecondary}
            value={currentNeeds}
            onChangeText={setCurrentNeeds}
            multiline
          />

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: Colors.roles.paramedic }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <MaterialCommunityIcons name="send" size={22} color="white" style={{ marginRight: 10 }} />
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
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  inputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 55,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    textAlign: 'right',
  },
  textArea: {
    height: 120,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    textAlign: 'right',
    marginBottom: 20,
  },
  pickerWrapper: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
