import React, { useState, useContext } from 'react';
import {
    View, Text, TextInput, StyleSheet, ScrollView, SafeAreaView,
    TouchableOpacity, Alert, useColorScheme, ActivityIndicator,
    KeyboardAvoidingView, Platform, Animated, RefreshControl
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { AuthContext, AuthContextType } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import API from '../../lib/axios';

export default function ProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() || 'light';
    const theme = COLORS[colorScheme];
    const shadow = SHADOWS[colorScheme];
    const auth = useContext(AuthContext) as AuthContextType;

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // تأثيرات الحركة
    const fadeAnim = new Animated.Value(1);
    const scaleAnim = new Animated.Value(1);

    const handlePasswordUpdate = async () => {
        if (!currentPassword || !newPassword) {
            return Alert.alert('خطأ', 'يرجى ملء حقلي كلمة المرور الحالية والجديدة.');
        }
        
        if (newPassword.length < 6) {
            return Alert.alert('خطأ', 'كلمة المرور الجديدة يجب أن تحتوي على 6 أحرف على الأقل.');
        }
        
        if (newPassword !== confirmPassword) {
            return Alert.alert('خطأ', 'كلمة المرور الجديدة وتأكيدها غير متطابقين.');
        }

        // تأثير حركي عند الضغط
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true })
        ]).start();

        setIsSubmitting(true);
        try {
            const res = await API.put('/paramedic/profile', {
                currentPassword,
                newPassword,
            }, {
                headers: { Authorization: `Bearer ${auth.authToken}` }
            });

            if (res.data.success) {
                Alert.alert('نجاح', 'تم تحديث كلمة المرور بنجاح.');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                // إخفاء كلمات المرور بعد النجاح
                setShowPasswords({ current: false, new: false, confirm: false });
            } else {
                throw new Error(res.data.message || 'فشل تحديث كلمة المرور.');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'حدث خطأ غير متوقع.';
            Alert.alert('خطأ', message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "تأكيد تسجيل الخروج",
            "هل أنت متأكد من رغبتك في تسجيل الخروج؟",
            [
                { text: "إلغاء", style: "cancel" },
                { 
                    text: "تأكيد", 
                    onPress: () => {
                        // تأثير حركي عند تسجيل الخروج
                        Animated.timing(fadeAnim, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true
                        }).start(() => auth.logout());
                    }, 
                    style: "destructive" 
                }
            ]
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        // يمكن إضافة تحديث البيانات هنا
        setTimeout(() => setRefreshing(false), 1000);
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const renderPasswordInput = (
        value: string,
        onChangeText: (text: string) => void,
        placeholder: string,
        field: 'current' | 'new' | 'confirm'
    ) => (
        <View style={styles.inputContainer}>
            <TextInput 
                style={[styles.input, { 
                    color: theme.text, 
                    borderColor: value ? COLORS.roles.paramedic : theme.border,
                    backgroundColor: theme.background
                }]} 
                placeholder={placeholder}
                placeholderTextColor={theme.textTertiary}
                secureTextEntry={!showPasswords[field]}
                onChangeText={onChangeText} 
                value={value}
                autoCapitalize="none"
                textContentType="password"
            />
            <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => togglePasswordVisibility(field)}
            >
                <MaterialCommunityIcons 
                    name={showPasswords[field] ? "eye-off" : "eye"} 
                    size={20} 
                    color={theme.textSecondary} 
                />
            </TouchableOpacity>
        </View>
    );

    if (!auth.user) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={COLORS.roles.paramedic} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                    جاري التحميل...
                </Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ title: 'الملف الشخصي', headerShown: false }} />
            
            <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header Section */}
                        <View style={styles.header}>
                            <Text style={[styles.headerTitle, { color: theme.text }]}>
                                الملف الشخصي
                            </Text>
                            <MaterialCommunityIcons 
                                name="account-cog" 
                                size={24} 
                                color={theme.textSecondary} 
                            />
                        </View>

                        {/* معلومات المستخدم المحسنة */}
                        <Animated.View style={[
                            styles.profileHeader, 
                            { backgroundColor: theme.card, ...shadow.medium },
                            { transform: [{ scale: scaleAnim }] }
                        ]}>
                            <View style={[styles.avatar, { backgroundColor: COLORS.roles.paramedicLight }]}>
                                <MaterialCommunityIcons 
                                    name="account-heart-outline" 
                                    size={50} 
                                    color={COLORS.roles.paramedic} 
                                />
                            </View>
                            <Text style={[styles.userName, { color: theme.text }]}>
                                {auth.user.fullName}
                            </Text>
                            <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                                {auth.user.email}
                            </Text>
                            <View style={[styles.statusBadge, { backgroundColor: COLORS.status.availableLight }]}>
                                <MaterialCommunityIcons 
                                    name="shield-check" 
                                    size={16} 
                                    color={COLORS.status.available} 
                                />
                                <Text style={[styles.statusText, { color: COLORS.status.available }]}>
                                    مُسجل ونشط
                                </Text>
                            </View>
                        </Animated.View>
                        
                        {/* إحصائيات سريعة */}
                        <View style={[styles.statsContainer, { backgroundColor: theme.card, ...shadow.small }]}>
                            <View style={styles.statItem}>
                                <MaterialCommunityIcons 
                                    name="calendar-clock" 
                                    size={24} 
                                    color={COLORS.accent.info} 
                                />
                                <Text style={[styles.statValue, { color: theme.text }]}>24</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                    يوم نشط
                                </Text>
                            </View>
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />
                            <View style={styles.statItem}>
                                <MaterialCommunityIcons 
                                    name="ambulance" 
                                    size={24} 
                                    color={COLORS.accent.success} 
                                />
                                <Text style={[styles.statValue, { color: theme.text }]}>12</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                    حالة طوارئ
                                </Text>
                            </View>
                        </View>
                        
                        {/* نموذج تغيير كلمة المرور المحسن */}
                        <View style={[styles.formSection, { backgroundColor: theme.card, ...shadow.small }]}>
                            <View style={styles.sectionHeader}>
                                <MaterialCommunityIcons 
                                    name="lock-reset" 
                                    size={24} 
                                    color={COLORS.roles.paramedic} 
                                />
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                    تغيير كلمة المرور
                                </Text>
                            </View>
                            
                            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
                                لحماية حسابك، يُنصح بتغيير كلمة المرور بانتظام
                            </Text>
                            
                            {renderPasswordInput(
                                currentPassword,
                                setCurrentPassword,
                                "كلمة المرور الحالية",
                                'current'
                            )}
                            
                            {renderPasswordInput(
                                newPassword,
                                setNewPassword,
                                "كلمة المرور الجديدة (6 أحرف على الأقل)",
                                'new'
                            )}
                            
                            {renderPasswordInput(
                                confirmPassword,
                                setConfirmPassword,
                                "تأكيد كلمة المرور الجديدة",
                                'confirm'
                            )}
                            
                            {/* مؤشر قوة كلمة المرور */}
                            {newPassword.length > 0 && (
                                <View style={styles.passwordStrength}>
                                    <Text style={[styles.strengthLabel, { color: theme.textSecondary }]}>
                                        قوة كلمة المرور:
                                    </Text>
                                    <View style={styles.strengthBar}>
                                        <View style={[
                                            styles.strengthFill,
                                            { 
                                                width: `${Math.min((newPassword.length / 8) * 100, 100)}%`,
                                                backgroundColor: newPassword.length < 6 ? COLORS.status.unavailable : 
                                                                newPassword.length < 8 ? COLORS.status.limited : 
                                                                COLORS.status.available
                                            }
                                        ]} />
                                    </View>
                                </View>
                            )}
                            
                            <TouchableOpacity 
                                style={[
                                    styles.button, 
                                    { backgroundColor: COLORS.roles.paramedic },
                                    isSubmitting && styles.buttonDisabled
                                ]} 
                                onPress={handlePasswordUpdate} 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="content-save" size={20} color="white" />
                                        <Text style={styles.buttonText}>حفظ التغييرات</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                        
                        {/* معلومات إضافية */}
                        <View style={[styles.infoSection, { backgroundColor: theme.card, ...shadow.small }]}>
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons 
                                    name="identifier" 
                                    size={20} 
                                    color={theme.textSecondary} 
                                />
                                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                                    الرقم الوطني
                                </Text>
                                <Text style={[styles.infoValue, { color: theme.text }]}>
                                    {auth.user.nationalId || 'غير محدد'}
                                </Text>
                            </View>
                            
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />
                            
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons 
                                    name="ambulance" 
                                    size={20} 
                                    color={theme.textSecondary} 
                                />
                                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                                    سيارة الإسعاف المرتبطة
                                </Text>
                                <Text style={[styles.infoValue, { color: theme.text }]}>
                                    {auth.user.associatedAmbulance || 'غير محدد'}
                                </Text>
                            </View>
                        </View>
                        
                        {/* زر تسجيل الخروج المحسن */}
                        <TouchableOpacity 
                            style={[styles.button, styles.logoutButton]} 
                            onPress={handleLogout}
                        >
                            <MaterialCommunityIcons name="logout" size={22} color="white" />
                            <Text style={styles.buttonText}>تسجيل الخروج</Text>
                        </TouchableOpacity>

                        {/* مساحة إضافية للتمرير */}
                        <View style={{ height: SIZES.large }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1 
    },
    scrollContent: { 
        padding: SIZES.padding 
    },
    centered: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    loadingText: {
        marginTop: SIZES.medium,
        ...FONTS.body
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.large,
        paddingHorizontal: SIZES.small
    },
    headerTitle: {
        ...FONTS.h2,
        fontWeight: '700'
    },
    profileHeader: { 
        alignItems: 'center', 
        padding: SIZES.large, 
        borderRadius: SIZES.radiusXLarge, 
        marginBottom: SIZES.large 
    },
    avatar: { 
        width: 100, 
        height: 100, 
        borderRadius: 50, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: SIZES.medium,
        shadowColor: COLORS.roles.paramedic,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    },
    userName: { 
        ...FONTS.h2,
        marginBottom: SIZES.small
    },
    userEmail: { 
        ...FONTS.body, 
        marginBottom: SIZES.medium
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.medium,
        paddingVertical: SIZES.small,
        borderRadius: SIZES.radius,
        gap: SIZES.small
    },
    statusText: {
        ...FONTS.caption,
        fontWeight: '600'
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.large,
        borderRadius: SIZES.radiusLarge,
        marginBottom: SIZES.large
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: SIZES.small
    },
    statValue: {
        ...FONTS.h3,
        fontWeight: '700'
    },
    statLabel: {
        ...FONTS.caption,
        textAlign: 'center'
    },
    divider: {
        width: 1,
        height: 40,
        marginHorizontal: SIZES.medium
    },
    formSection: { 
        padding: SIZES.large, 
        borderRadius: SIZES.radiusLarge,
        marginBottom: SIZES.large
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SIZES.medium,
        marginBottom: SIZES.small
    },
    sectionTitle: { 
        ...FONTS.h4, 
        fontWeight: '600'
    },
    sectionDescription: {
        ...FONTS.bodySmall,
        marginBottom: SIZES.large,
        lineHeight: 20
    },
    inputContainer: {
        position: 'relative',
        marginBottom: SIZES.medium
    },
    input: { 
        ...FONTS.body, 
        height: 55, 
        paddingHorizontal: SIZES.medium,
        paddingRight: 50, // مساحة لأيقونة العين
        borderRadius: SIZES.radius, 
        borderWidth: 1.5, 
        textAlign: 'right'
    },
    eyeIcon: {
        position: 'absolute',
        left: SIZES.medium,
        top: '50%',
        transform: [{ translateY: -10 }],
        padding: SIZES.small
    },
    passwordStrength: {
        marginBottom: SIZES.medium
    },
    strengthLabel: {
        ...FONTS.caption,
        marginBottom: SIZES.small
    },
    strengthBar: {
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        overflow: 'hidden'
    },
    strengthFill: {
        height: '100%',
        borderRadius: 2
    },
    button: { 
        height: 55, 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderRadius: SIZES.radius, 
        marginTop: SIZES.base, 
        flexDirection: 'row', 
        gap: SIZES.small,
        shadowColor: COLORS.roles.paramedic,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2
    },
    buttonDisabled: {
        opacity: 0.7
    },
    buttonText: { 
        ...FONTS.button, 
        color: 'white' 
    },
    logoutButton: {
        backgroundColor: COLORS.status.unavailable,
        marginTop: SIZES.medium,
    },
    infoSection: {
        padding: SIZES.large,
        borderRadius: SIZES.radiusLarge,
        marginBottom: SIZES.large
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SIZES.medium,
        gap: SIZES.medium
    },
    infoLabel: {
        ...FONTS.body,
        flex: 1
    },
    infoValue: {
        ...FONTS.body,
        fontWeight: '600'
    }
});