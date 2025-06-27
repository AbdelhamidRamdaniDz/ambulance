import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import API from '../lib/axios';
import axios from 'axios';

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

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const res = await API.post('/auth/login', { 
                email, 
                password, 
                role: 'paramedic'
            });

            const data = res.data;

            if (!data.success) {
                throw new Error(data.message || 'Login failed');
            }

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
            throw error;
        } finally {
            setIsLoading(false);
        }
    };
    
    const logout = async () => {
        try {
            await API.get('/auth/logout');
        } catch (error) {
            console.error("Failed to logout on server, proceeding with client-side logout.", error);
        } finally {
            await AsyncStorage.multiRemove(['authToken', 'user']);
            setAuthToken(null);
            setUser(null);
            setIsAuthenticated(false);
            router.replace('/(auth)/login');
        }
    };

    return (
        <AuthContext.Provider value={{ authToken, user, isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
