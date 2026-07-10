import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types';
import { mockUsers } from '../data/mockData';
import { loginUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (role: UserRole, userId?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@thewash_auth_user';
const ROLE_STORAGE_KEY = '@thewash_auth_role';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const storedRole = await AsyncStorage.getItem(ROLE_STORAGE_KEY);
      if (storedUser && storedRole) {
        setUser(JSON.parse(storedUser));
        setRole(storedRole as UserRole);
      }
    } catch (error) {
      console.error('Failed to load auth state', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (selectedRole: UserRole, userId?: string) => {
    let selectedUser: User | undefined;

    try {
      selectedUser = await loginUser(selectedRole, userId);
    } catch (error) {
      console.warn('Falling back to mock auth:', error);
      if (userId) {
        selectedUser = mockUsers.find((u) => u.id === userId);
      }

      if (!selectedUser) {
        selectedUser = mockUsers.find((u) => u.role === selectedRole);
      }
    }

    if (!selectedUser) {
      throw new Error(`No user found for role: ${selectedRole}`);
    }

    setUser(selectedUser);
    setRole(selectedRole);

    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(selectedUser));
      await AsyncStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
    } catch (error) {
      console.error('Failed to persist auth state', error);
    }
  };

  const logout = async () => {
    setUser(null);
    setRole(null);
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      await AsyncStorage.removeItem(ROLE_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear auth state', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
