import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import API from '../lib/axios';

export interface AuthContextType {
    authToken: string | null;
    user: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('authToken');
                const storedUser = await AsyncStorage.getItem('user');

                if (storedToken && storedUser) {
                    setAuthToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    setIsAuthenticated(true);
                }
            } catch (e) {
                console.error("Failed to load auth data.", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadAuthData();
    }, []);

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const res = await API.post('/auth/login', { 
                email, 
                password, 
                role: 'paramedic' // إرسال دور المسعف بشكل ثابت
            });

            const data = res.data;

            if (!data.success) {
                // ✅ تم التعديل: قراءة رسالة الخطأ من data.message
                throw new Error(data.message || 'Login failed');
            }

            // ✅ تم التعديل: قراءة المستخدم من data.data
            const userData = data.data;
            const token = data.token;

            if (!userData || !token) {
                throw new Error('User data or token is missing from API response');
            }

            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('user', JSON.stringify(userData));

            setAuthToken(token);
            setUser(userData);
            setIsAuthenticated(true);

        } catch (error) {
            console.error("Login API error:", error);
            throw error; // إرسال الخطأ ليتم عرضه في صفحة تسجيل الدخول
        } finally {
            setIsLoading(false);
        }
    };
    
    const logout = async () => {
        try {
            // ✅ تم التعديل: استدعاء مسار الخادم لتسجيل الخروج
            await API.get('/auth/logout');
        } catch (error) {
            console.error("Failed to logout on server, proceeding with client-side logout.", error);
        } finally {
            // مسح البيانات من التطبيق بغض النظر عن استجابة الخادم
            await AsyncStorage.multiRemove(['authToken', 'user']);
            setAuthToken(null);
            setUser(null);
            setIsAuthenticated(false);
            // توجيه المستخدم إلى صفحة تسجيل الدخول
            router.replace('/(auth)/login');
        }
    };

    return (
        <AuthContext.Provider value={{ authToken, user, isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}