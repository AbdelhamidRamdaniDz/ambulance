import React, { useState, useContext, useEffect, useCallback } from 'react';
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
import API from '../../lib/axios';
import axios from 'axios';

// --- واجهات البيانات ---
interface BedStatus {
    total: number;
    occupied: number;
}
interface HospitalStatus {
    _id: string;
    name: string;
    isERAvailable: boolean;
    availableBeds?: Record<string, BedStatus>;
}
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

// --- المكون الرئيسي ---
export default function AddCaseScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() || 'light';
    const theme = COLORS[colorScheme];
    const auth = useContext(AuthContext) as AuthContextType;
    const params = useLocalSearchParams<{ hospitalId?: string, hospitalName?: string }>();

    // --- متغيرات الحالة ---
    const [hospitals, setHospitals] = useState<HospitalStatus[]>([]);
    const [selectedHospital, setSelectedHospital] = useState<HospitalStatus | null>(null);
    const [showPatientForm, setShowPatientForm] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        medicalHistory: '',
        currentNeeds: '',
        bloodType: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- جلب بيانات المستشفيات ---
    useEffect(() => {
        const fetchHospitals = async () => {
            if (!auth.authToken) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await API.get('/paramedic/hospital-statuses', {
                    headers: { 'Authorization': `Bearer ${auth.authToken}` }
                });
                if (response.data.success) {
                    const hospitalData = response.data.data.map((item: any) => ({
                        _id: item.hospital._id,
                        name: item.hospital.name,
                        isERAvailable: item.isERAvailable,
                        availableBeds: item.availableBeds
                    }));
                    setHospitals(hospitalData);
                    if (params.hospitalId) {
                        const preSelected = hospitalData.find((h: HospitalStatus) => h._id === params.hospitalId);
                        if (preSelected) {
                            setSelectedHospital(preSelected);
                            setShowPatientForm(true);
                        }
                    }
                }
            } catch (error) {
                Alert.alert("خطأ", "فشل في تحميل بيانات المستشفيات.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchHospitals();
    }, [auth.authToken, params.hospitalId]);

    // --- معالجة التغييرات والإرسال ---
    const handleHospitalSelect = (hospitalId: string) => {
        const hospital = hospitals.find(h => h._id === hospitalId);
        setSelectedHospital(hospital || null);
        if (hospital) {
            setShowPatientForm(true);
        } else {
            setShowPatientForm(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.firstName || !formData.currentNeeds || !selectedHospital) {
            Alert.alert('حقول مطلوبة', 'يرجى إدخال اسم المريض، احتياجاته الحالية، واختيار المستشفى.');
            return;
        }
        setIsSubmitting(true);
        try {
            const caseData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                bloodType: formData.bloodType,
                medicalHistory: { allergies: [formData.medicalHistory] }, 
                currentCondition: formData.currentNeeds,
                assignedHospital: selectedHospital._id,
            };
            const response = await API.post('/patients', caseData, {
                 headers: { 'Authorization': `Bearer ${auth.authToken}` }
            });

            if (response.data.success) {
                Alert.alert('نجاح', 'تم إرسال الحالة بنجاح.', [{ text: 'OK', onPress: () => router.back() }]);
            } else {
                throw new Error(response.data.message || 'فشل في إنشاء الحالة');
            }
        } catch (error: any) {
            Alert.alert('خطأ في الإرسال', error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
       return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.accent.primary}/></View>
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ title: 'إنشاء حالة جديدة', headerStyle: { backgroundColor: theme.card }, headerTitleStyle: { color: theme.text, ...FONTS.title }, headerTintColor: theme.text }} />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={[styles.section, { backgroundColor: theme.card, ...SHADOWS[colorScheme].small }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>1. اختيار المستشفى</Text>
                        <View style={[styles.pickerWrapper, { borderColor: theme.border }]}>
                            <Picker selectedValue={selectedHospital?._id} onValueChange={(val) => handleHospitalSelect(val)} style={{ color: theme.text }}>
                                <Picker.Item label="-- اختر مستشفى متاح --" value="" />
                                {hospitals.filter((h: HospitalStatus) => h.isERAvailable).map(h => <Picker.Item key={h._id} label={h.name} value={h._id} />)}
                            </Picker>
                        </View>
                    </View>

                    {selectedHospital && (
                        <HospitalStatusCard 
                            hospital={selectedHospital} 
                            theme={theme} 
                            shadow={SHADOWS[colorScheme]} 
                        />
                    )}

                    {showPatientForm && (
                        <View style={styles.patientFormContainer}>
                            <View style={[styles.section, { backgroundColor: theme.card, ...SHADOWS[colorScheme].small }]}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>2. معلومات المريض</Text>
                                <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} placeholder="الاسم الأول" onChangeText={val => handleInputChange('firstName', val)} />
                                <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} placeholder="اسم العائلة" onChangeText={val => handleInputChange('lastName', val)} />
                            </View>
                            <View style={[styles.section, { backgroundColor: theme.card, ...SHADOWS[colorScheme].small }]}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>3. التفاصيل الطبية</Text>
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
                                style={[styles.submitButton, { backgroundColor: COLORS.roles.paramedic }, isSubmitting && styles.submitButtonDisabled, SHADOWS[colorScheme].medium]}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <><MaterialCommunityIcons name="send" size={SIZES.icon.medium} color="white" /><Text style={styles.submitButtonText}>تأكيد وإرسال الحالة</Text></>}
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// --- مكونات مساعدة ---
const HospitalStatusCard = ({ hospital, theme, shadow }: any) => (
    <View style={[styles.section, styles.statusCard, { backgroundColor: theme.card, ...shadow.small }]}>
        <View style={styles.statusHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0, flex: 1 }]}>{hospital.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: hospital.isERAvailable ? `${COLORS.status.available}20` : `${COLORS.status.unavailable}20`}]}>
                <View style={[styles.statusDot, { backgroundColor: hospital.isERAvailable ? COLORS.status.available : COLORS.status.unavailable }]} />
                <Text style={[styles.statusText, {color: hospital.isERAvailable ? COLORS.status.available : COLORS.status.unavailable}]}>{hospital.isERAvailable ? 'الطوارئ متاحة' : 'الطوارئ غير متاحة'}</Text>
            </View>
        </View>
        <View style={styles.bedsContainer}>
            <BedInfo label="عناية مركزة" status={hospital.availableBeds?.['العناية المركزة (ICU)']} theme={theme} />
            <BedInfo label="طوارئ" status={hospital.availableBeds?.['الطوارئ (Emergency)']} theme={theme} />
        </View>
    </View>
);

const BedInfo = ({ label, status, theme }: { label: string, status?: BedStatus, theme: any }) => {
    if (!status) return <View style={styles.bedInfoBox}><Text style={[styles.bedLabel, {color: theme.textSecondary}]}>{label}: غير محدد</Text></View>;
    const available = status.total - status.occupied;
    return (
        <View style={[styles.bedInfoBox, {backgroundColor: `${COLORS.accent.primary}10`}]}>
            <Text style={[styles.bedLabel, {color: COLORS.accent.primary}]}>{label}</Text>
            <View style={{flexDirection: 'row-reverse', alignItems: 'baseline', gap: 4}}>
                <Text style={[styles.bedCount, {color: theme.text}]}>{available}</Text>
                <Text style={[styles.bedTotal, {color: theme.textSecondary}]}>/ {status.total} سرير</Text>
            </View>
        </View>
    )
};


const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    scrollContent: { padding: SIZES.padding },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    section: { marginBottom: SIZES.large, borderRadius: SIZES.radiusLarge, padding: SIZES.padding },
    sectionTitle: { ...FONTS.h4, marginBottom: SIZES.medium, textAlign: 'right' },
    pickerWrapper: { borderRadius: SIZES.radius, borderWidth: 1, marginBottom: SIZES.medium, justifyContent: 'center' },
    input: { ...FONTS.body, height: 55, paddingHorizontal: SIZES.medium, borderRadius: SIZES.radius, borderWidth: 1, textAlign: 'right', marginBottom: SIZES.medium },
    textArea: { ...FONTS.body, height: 110, padding: SIZES.medium, borderRadius: SIZES.radius, borderWidth: 1, textAlign: 'right', textAlignVertical: 'top', marginBottom: SIZES.medium },
    statusCard: { padding: SIZES.padding, marginVertical: SIZES.base },
    statusHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.medium },
    statusBadge: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 6 },
    statusText: { ...FONTS.body, fontWeight: 'bold' },
    bedsContainer: { flexDirection: 'row-reverse', justifyContent: 'space-around', gap: SIZES.medium, marginBottom: SIZES.padding },
    bedInfoBox: { flex: 1, padding: SIZES.medium, borderRadius: SIZES.radius, alignItems: 'center' },
    bedLabel: { ...FONTS.body, fontSize: SIZES.small, marginBottom: 4 },
    bedCount: { ...FONTS.h3 },
    bedTotal: { ...FONTS.body, fontSize: 10 },
    patientFormContainer: { marginTop: SIZES.large, borderTopWidth: 1, borderColor: '#eee', paddingTop: SIZES.large },
    submitButton: { flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', gap: SIZES.small, padding: SIZES.padding, borderRadius: SIZES.radiusLarge, marginTop: SIZES.base },
    submitButtonDisabled: { opacity: 0.7 },
    submitButtonText: { ...FONTS.button, color: 'white' },
});
