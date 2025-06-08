// context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

type UserRole = 'paramedic' | 'hospital';

export interface AuthContextType {
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setRole: (role: UserRole) => Promise<void>;
  login: (role: UserRole) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  userRole: null,
  isAuthenticated: false,
  isLoading: true,
  setRole: async () => {},
  login: () => {},
  logout: async () => {},
});

// 3. تعريف نوع الـ props للـ Provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // 4. إعطاء نوع صريح للحالة (State)
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRoleAndAuth = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole') as UserRole | null;
        if (role) {
          setUserRole(role);
        }
      } catch (e) {
        console.error("Failed to load user role.", e);
      } finally {
        setIsLoading(false);
      }
    };

    checkRoleAndAuth();
  }, []);

  const login = (role: UserRole) => {
    setIsAuthenticated(true);
  };

  const setRole = async (role: UserRole) => {
    try {
        await AsyncStorage.setItem('userRole', role);
        setUserRole(role);
        router.replace('/login');
    } catch (e) {
        console.error("Failed to set user role.", e);
    }
  };
  
  const logout = async () => {
      try {
        await AsyncStorage.removeItem('userRole');
        setIsAuthenticated(false);
        setUserRole(null);
        router.replace('/select-role');
      } catch(e) {
        console.error("Failed to logout.", e)
      }
  };

  return (
    <AuthContext.Provider value={{ userRole, isAuthenticated, isLoading, setRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}