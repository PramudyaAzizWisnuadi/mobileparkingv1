import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, LoginCredentials, LoginResponse } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role?: string; // admin, petugas, etc.
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  setUserRole: (role: string) => void; // Add function to manually set role for testing
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      
      // Clear stored user data
      try {
        await AsyncStorage.removeItem('user_data');
      } catch (storageError) {
        console.warn('Failed to clear user data:', storageError);
      }
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const authenticated = await apiService.isAuthenticated();
      
      if (authenticated) {
        // Try to restore user data from storage
        try {
          const savedUserData = await AsyncStorage.getItem('user_data');
          if (savedUserData) {
            const userData = JSON.parse(savedUserData);
            setUser(userData);
          }
        } catch (storageError) {
          console.warn('Failed to restore user data:', storageError);
        }
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        // Clear stored user data
        try {
          await AsyncStorage.removeItem('user_data');
        } catch (storageError) {
          console.warn('Failed to clear user data:', storageError);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      setIsLoading(true);
      const response = await apiService.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Save user data to storage
        try {
          await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
        } catch (storageError) {
          console.warn('Failed to save user data:', storageError);
        }
      }
      
      return response;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to manually set user role for testing
  const setUserRole = useCallback((role: string) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
    }
  }, [user]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus,
    setUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
