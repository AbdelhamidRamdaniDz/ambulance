import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// --- ⚠️ استبدل هذا الرابط بعنوان IP المحلي الخاص بحاسوبك ---
const API_URL = 'https://3510-129-45-33-55.ngrok-free.app/api/auth'; 

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
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // إرسال دور المسعف بشكل ثابت
        body: JSON.stringify({ email, password, role: 'paramedic' }), 
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      if (!data.user || !data.token) {
        throw new Error('User data or token is missing from API response');
      }

      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      setAuthToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);

    } catch (error) {
        console.error("Login API error:", error);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };
  
  const logout = async () => {
      await AsyncStorage.multiRemove(['authToken', 'user']);
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ authToken, user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}